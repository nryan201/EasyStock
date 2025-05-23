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
            public string Name { get; set; }
            public int Stock { get; set; }
            public int CategoryId { get; set; }
        }
    }
}

