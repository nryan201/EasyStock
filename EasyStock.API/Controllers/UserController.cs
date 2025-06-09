using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;
using EasyStock.API.Dtos;

namespace EasyStock.API.Controllers
{
    [ApiController]
    [Route("api/users")]
    public class UserController : ControllerBase
    {
        [HttpGet]
        public IActionResult GetUsers()
        {
            string connStr = "Server=localhost;Database=easystock;User ID=root;Password=root;";
            var users = new List<UserInfoDto>();

            try
            {
                using var connection = new MySqlConnection(connStr);
                connection.Open();

                var command = new MySqlCommand("SELECT id, username, email, role FROM users", connection);
                using var reader = command.ExecuteReader();
                while (reader.Read())
                {
                    users.Add(new UserInfoDto
                    {
                        Id = Convert.ToInt32(reader["id"]),
                        Username = reader["username"].ToString() ?? "",
                        Email = reader["email"].ToString() ?? "",
                        Role = reader["role"].ToString() ?? "user"
                    });
                }

                return Ok(users);
            }
            catch (Exception e)
            {
                return StatusCode(500, new { error = e.Message });
            }
        }
        [HttpPost("update-role")]
        public IActionResult UpdateUserRole([FromBody] UpdateRoleDto dto)
        {
            Console.WriteLine($"🔧 Mise à jour du rôle: id={dto.UserId}, role={dto.Role}");
            string connStr = "Server=localhost;Database=easystock;User ID=root;Password=root;";
            try
            {
                using var connection = new MySqlConnection(connStr);
                connection.Open();

                var command = new MySqlCommand("UPDATE users SET role = @role WHERE id = @id", connection);
                command.Parameters.AddWithValue("@id", dto.UserId);
                command.Parameters.AddWithValue("@role", dto.Role);
                int rows = command.ExecuteNonQuery();

                if (rows > 0)
                    return Ok(new { message = "Rôle mis à jour" });
                else
                    return NotFound(new { message = "Utilisateur introuvable" });
            }
            catch (Exception e)
            {
                return StatusCode(500, new { error = e.Message });
            }
        }
    }
}