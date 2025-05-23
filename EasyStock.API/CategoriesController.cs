using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;

namespace EasyStock.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriesController : ControllerBase
    {
        [HttpPost]

        public IActionResult Create([FromBody] CategoryDto category)
        {
            string connStr_ = "Server=localhost;Database=easystock;User ID=root;Password=root;";
            try
            {
                using var connection = new MySqlConnection(connStr_);
                connection.Open();
             
                var command = new MySqlCommand("Insert into category (NAME) values (@name)", connection);
                command.Parameters.AddWithValue("@name", category.Name);
                command.ExecuteNonQuery();
                
                return Ok(new { message = "Category created successfully" });
                
            }
            catch (Exception e)
            {
                return StatusCode(500, new { error = e.Message });
            }
        }
        public class CategoryDto
        {
            public string Name { get; set; }
        }
    }
}