using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;
using EasyStock.API.Dtos;
namespace EasyStock.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        [HttpPost]
        public IActionResult Create([FromBody] ProductDto product)
        {
            string connStr_ = "Server=localhost;Database=easystock;User ID=root;Password=root;";

            try
            {
                using var connection = new MySqlConnection(connStr_);
                connection.Open();
                var command =
                    new MySqlCommand(
                        "Insert into product (NAME, STOCK,CATEGORY_ID) values (@name, @stock, @categoryId)",
                        connection);
                command.Parameters.AddWithValue("@name", product.Name);
                command.Parameters.AddWithValue("@stock", product.Stock);
                command.Parameters.AddWithValue("@categoryId", product.CategoryId);
                command.ExecuteNonQuery();
                long insertedId = command.LastInsertedId;
                return Ok(new { id = insertedId, message = "Product created successfully" });
            }
            catch (Exception e)
            {
                return StatusCode(500, new { error = e.Message });
            }


        }
        [HttpGet]
        public IActionResult GetAll()
        {
            string connstr_ = "Server=localhost;Database=easystock;User ID=root;Password=root;";
            var products = new List<ProductDto>();
            try
            {
                using var connection = new MySqlConnection(connstr_);
                connection.Open();

                var command = new MySqlCommand("SELECT * FROM product", connection);
                using var reader = command.ExecuteReader();

                while (reader.Read()) 
                {
                    products.Add(new ProductDto {
                        Id = Convert.ToInt32(reader["ID"]),  // <= AJOUTE CECI
                        Name = reader["NAME"].ToString() ?? string.Empty,
                        Stock = Convert.ToInt32(reader["STOCK"]),
                        CategoryId = Convert.ToInt32(reader["CATEGORY_ID"])
                    });
                }

                return Ok(products);
            }
            catch (Exception e)
            {
                return StatusCode(500, new { error = e.Message });
            }





        }

        [HttpGet("evolution/{productId}")]
        public IActionResult GetStockEvolution(int productId)
        {
            string connStr = "Server=localhost;Database=easystock;User ID=root;Password=root;";
            var evolution = new List<object>();

            try
            {
                using var connection = new MySqlConnection(connStr);
                connection.Open();

                var command = new MySqlCommand(@"
            SELECT MOVEMENT_DATE, MOVEMENT_TYPE, QUANTITY 
            FROM mouvements 
            WHERE PRODUCT_ID = @productId 
            ORDER BY MOVEMENT_DATE", connection);

                command.Parameters.AddWithValue("@productId", productId);
                using var reader = command.ExecuteReader();

                int stock = 0;

                while (reader.Read())
                {
                    var type = reader["MOVEMENT_TYPE"].ToString();
                    var qty = Convert.ToInt32(reader["QUANTITY"]);

                    stock += (type == "entrée") ? qty : -qty;

                    evolution.Add(new
                    {
                        date = Convert.ToDateTime(reader["MOVEMENT_DATE"]).ToString("yyyy-MM-dd"),
                        stock = stock
                    });
                }

                return Ok(evolution);
            }
            catch (Exception e)
            {
                return StatusCode(500, new { error = e.Message });
            }
        }
        [HttpGet("by-category/{categoryId}")]
        public IActionResult GetByCategory(int categoryId)
        {
            string connStr = "Server=localhost;Database=easystock;User ID=root;Password=root;";
            var products = new List<ProductDto>();

            try
            {
                using var connection = new MySqlConnection(connStr);
                connection.Open();

                var command = new MySqlCommand("SELECT * FROM product WHERE CATEGORY_ID = @categoryId", connection);
                command.Parameters.AddWithValue("@categoryId", categoryId);

                using var reader = command.ExecuteReader();
                while (reader.Read())
                {
                    products.Add(new ProductDto
                    {
                        Id = Convert.ToInt32(reader["ID"]),
                        Name = reader["NAME"].ToString() ?? string.Empty,
                        Stock = Convert.ToInt32(reader["STOCK"]),
                        CategoryId = Convert.ToInt32(reader["CATEGORY_ID"])
                    });
                }

                return Ok(products);
            }
            catch (Exception e)
            {
                return StatusCode(500, new { error = e.Message });
            }
        }
        [HttpPost("delete-with-password")]
        public IActionResult DeleteWithPassword([FromBody] DeleteWithPasswordDto dto)
        {
            Console.WriteLine($"🔍 Rôle reçu : {dto.Role}");
            string connStr = "Server=localhost;Database=easystock;User ID=root;Password=root;";

            try
            {
                using var connection = new MySqlConnection(connStr);
                connection.Open();
                // ✅ Vérification du mot de passe seulement si rôle ≠ admin
                if (dto.Role != "admin")
                {
                    var passwordCmd = new MySqlCommand("SELECT password FROM admin_password WHERE id = 1", connection);
                    var hashedPassword = passwordCmd.ExecuteScalar()?.ToString();

                    if (string.IsNullOrEmpty(hashedPassword) || !BCrypt.Net.BCrypt.Verify(dto.AdminPassword, hashedPassword))
                    {
                        return Unauthorized(new { message = "Mot de passe admin invalide" });
                    }
                }

                // 🔁 Supprimer les mouvements
                var deleteMovements = new MySqlCommand("DELETE FROM mouvements WHERE PRODUCT_ID = @id", connection);
                deleteMovements.Parameters.AddWithValue("@id", dto.ProductId);
                deleteMovements.ExecuteNonQuery();

                // 🧼 Supprimer le produit
                var deleteCmd = new MySqlCommand("DELETE FROM product WHERE id = @id", connection);
                deleteCmd.Parameters.AddWithValue("@id", dto.ProductId);
                int rowsAffected = deleteCmd.ExecuteNonQuery();

                if (rowsAffected == 0)
                    return NotFound(new { message = "Produit non trouvé" });

                return Ok(new { message = "Produit supprimé avec succès" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public IActionResult UpdateProduct(int id, [FromBody] ProductDto product)
        {
            string connStr = "Server=localhost;Database=easystock;User ID=root;Password=root;";
            try
            {
                using var connection = new MySqlConnection(connStr);
                connection.Open();

                var command = new MySqlCommand("UPDATE product SET NAME = @name, STOCK = @stock, CATEGORY_ID = @categoryId WHERE ID = @id", connection);
                command.Parameters.AddWithValue("@name", product.Name);
                command.Parameters.AddWithValue("@stock", product.Stock);
                command.Parameters.AddWithValue("@categoryId", product.CategoryId);
                command.Parameters.AddWithValue("@id", id);

                var affected = command.ExecuteNonQuery();
                if (affected == 0) return NotFound();

                return Ok(new { message = "Produit mis à jour avec succès" });
            }
            catch (Exception e)
            {
                return StatusCode(500, new { error = e.Message });
            }
        }

    }


}


