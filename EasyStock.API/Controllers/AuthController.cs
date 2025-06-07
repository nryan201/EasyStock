using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;

namespace EasyStock.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        [HttpPost("register")]
        public IActionResult Register([FromBody] UserDto user)
        {
            string connStr_ = "Server=localhost;Database=easystock;User ID=root;Password=root;";
            try
            {
                using var connection = new MySqlConnection(connStr_);
                connection.Open();

                var command = new MySqlCommand("INSERT INTO users (username, password, email) VALUES (@username, @password, @email)", connection);
                command.Parameters.AddWithValue("@username", user.Username);
                command.Parameters.AddWithValue("@password", user.Password);
                command.Parameters.AddWithValue("@email", user.Email);
                command.ExecuteNonQuery();

                return Ok(new { message = "User registered successfully" });
            }
            catch (Exception e)
            {
                return StatusCode(500, new { error = e.Message });
            }
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginDto credentials)
        {
            string connStr = "Server=localhost;Database=easystock;User ID=root;Password=root;";
            try
            {
                using var connection = new MySqlConnection(connStr);
                connection.Open();

                var command = new MySqlCommand("SELECT * FROM users WHERE email = @email", connection);
                command.Parameters.AddWithValue("@email", credentials.Email);

                using var reader = command.ExecuteReader();
                if (reader.Read())
                {
                    string dbPassword = reader.GetString("password");

                    if (dbPassword == credentials.Password)
                    {
                        return Ok(new
                        {
                            message = "Connexion réussie",
                            username = reader.GetString("username"),
                            role = reader.GetString("role")
                        });
                    }
                    else
                    {
                        return Unauthorized(new { error = "Mot de passe incorrect" });
                    }
                }
                else
                {
                    return NotFound(new { error = "Utilisateur non trouvé" });
                }
            }
            catch (Exception e)
            {
                return StatusCode(500, new { error = e.Message });
            }
        }

        public class UserDto
        {
            public string Username { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
            public string Email { get; set; } = string.Empty;
        }

        public class LoginDto
        {
            public string Email { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
        }
    }
}
