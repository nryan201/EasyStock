using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using MySql.Data.MySqlClient;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;

namespace EasyStock.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly string _connStr = "Server=localhost;Database=easystock;User ID=root;Password=root;";
        private readonly IConfiguration _config;

        public AuthController(IConfiguration config)
        {
            _config = config;
        }

        [HttpPost("register")]
        public IActionResult Register([FromBody] UserDto user)
        {
            try
            {
                using var connection = new MySqlConnection(_connStr);
                connection.Open();

                string hashedPassword = BCrypt.Net.BCrypt.HashPassword(user.Password);

                var command = new MySqlCommand("INSERT INTO users (username, password, email) VALUES (@username, @password, @email)", connection);
                command.Parameters.AddWithValue("@username", user.Username);
                command.Parameters.AddWithValue("@password", hashedPassword);
                command.Parameters.AddWithValue("@email", user.Email);
                command.ExecuteNonQuery();

                return Ok(new { message = "Utilisateur enregistré avec succès" });
            }
            catch (Exception e)
            {
                return StatusCode(500, new { error = e.Message });
            }
        }

        [HttpPost("login")]
public IActionResult Login([FromBody] LoginDto credentials)
{
    try
    {
        using var connection = new MySqlConnection(_connStr);
        connection.Open();

        var command = new MySqlCommand(
            "SELECT id, username, email, password, role, is_admin, createdAt " +
            "FROM users WHERE email = @email", 
            connection);
        command.Parameters.AddWithValue("@email", credentials.Email);

        using var reader = command.ExecuteReader();
        if (!reader.Read())
            return NotFound(new { error = "Utilisateur introuvable" });

        // Vérification du mot de passe
        string dbPassword = reader.GetString("password");
        if (!BCrypt.Net.BCrypt.Verify(credentials.Password, dbPassword))
            return Unauthorized(new { error = "Mot de passe incorrect" });

        // Récupération des données utilisateur
        int userId       = reader.GetInt32("id");
        string username  = reader.GetString("username");
        string email     = reader.GetString("email");
        string role      = reader.GetString("role");
        bool isAdmin     = reader.GetBoolean("is_admin");
        DateTime createdAt = reader.GetDateTime("createdAt");

        // Génération du token JWT
        var key = Encoding.UTF8.GetBytes(_config["JwtSettings:SecretKey"]!);
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Name, username),
            new Claim(ClaimTypes.Email, email),
            new Claim(ClaimTypes.Role, role)
        };

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddHours(3),
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256Signature)
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);
        var tokenString = tokenHandler.WriteToken(token);

        // Retour de la réponse complète
        return Ok(new
        {
            token       = tokenString,
            id          = userId,
            username    = username,
            email       = email,
            role        = role,
            isAdmin     = isAdmin,
            createdAt   = createdAt.ToString("o")  // Format ISO 8601
        });
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
