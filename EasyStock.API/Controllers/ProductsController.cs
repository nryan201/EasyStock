using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;

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
                return Ok(new { message = "Product created successfully" });
            }
            catch (Exception e)
            {
                return StatusCode(500, new { error = e.Message });
            }


        }

        public class ProductDto
        {
            public string Name { get; set; }= string.Empty;
            public int Stock { get; set; }
            public int CategoryId { get; set; }
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
                
                var command= new MySqlCommand("SELECT * FROM product", connection);
                using var reader = command.ExecuteReader();

                while (reader.Read())
                {
                    products.Add(new ProductDto
                    {
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
    }
}

