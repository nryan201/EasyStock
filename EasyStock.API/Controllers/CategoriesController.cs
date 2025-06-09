using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;
using EasyStock.API.Dtos;
namespace EasyStock.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriesController : ControllerBase
    {
        [HttpPost]

        public IActionResult Create([FromBody] CategoryDto categories)
        {
            string connStr_ = "Server=localhost;Database=easystock;User ID=root;Password=root;";
            try
            {
                using var connection = new MySqlConnection(connStr_);
                connection.Open();
             
                var command = new MySqlCommand("Insert into categories (NAME) values (@name)", connection);
                command.Parameters.AddWithValue("@name", categories.Name);
                command.ExecuteNonQuery();
                
                return Ok(new { message = "Category created successfully" });
                
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
            var categories = new List<CategoryDto>();
            try
            {
                var connection = new MySqlConnection(connstr_);
                connection.Open();
                var command = new MySqlCommand("SELECT * FROM categories", connection);
                using var reader = command.ExecuteReader();
                while (reader.Read())
                {
                 categories.Add(new CategoryDto
                    {
                        id = Convert.ToInt32(reader["ID"]),
                        Name = reader["NAME"].ToString() ?? string.Empty
                    });   
                }

                return Ok(categories);
            }
            catch (Exception e)
            {
                return StatusCode(500, new { error = e.Message });
            }
            
            
        }
        [HttpGet("by-category/{categoryId}")]
        public IActionResult GetProductsByCategory(int categoryId)
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
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
        
    }
}