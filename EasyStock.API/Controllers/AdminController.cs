using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;
using EasyStock.API.Dtos;
using BCrypt.Net;
using System.Net;
using System.Net.Mail;

namespace EasyStock.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        // Stockage temporaire des codes par email
        private static Dictionary<string, string> _verificationCodes = new();

        [HttpPost("send-verification-code")]
        public IActionResult SendVerificationCode([FromBody] EmailRequest request)
        {
            try
            {
                var code = new Random().Next(100000, 999999).ToString();
                _verificationCodes[request.To] = code;

                var fromAddress = new MailAddress("easystockYnov@gmail.com", "EasyStock");
                var toAddress = new MailAddress(request.To);
                const string fromPassword = "wcxb sfrw cszf mlsw";
                const string subject = "Votre code de sécurité";
                string body = $"Voici votre code de sécurité : {code}";

                var smtp = new SmtpClient
                {
                    Host = "smtp.gmail.com",
                    Port = 587,
                    EnableSsl = true,
                    DeliveryMethod = SmtpDeliveryMethod.Network,
                    UseDefaultCredentials = false,
                    Credentials = new NetworkCredential(fromAddress.Address, fromPassword)
                };

                using var message = new MailMessage(fromAddress, toAddress)
                {
                    Subject = subject,
                    Body = body
                };
                smtp.Send(message);

                return Ok(new { message = "E-mail envoyé avec succès." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }


        [HttpPost("verify-code")]
        public IActionResult VerifyCode([FromBody] CodeVerificationDto dto)
        {
            if (string.IsNullOrEmpty(dto.Email) || string.IsNullOrEmpty(dto.Code))
                return BadRequest(new { message = "Email et code requis" });

            if (_verificationCodes.TryGetValue(dto.Email, out var savedCode) && savedCode == dto.Code)
            {
                _verificationCodes.Remove(dto.Email); // code utilisé, on l’enlève
                return Ok(new { message = "Code valide" });
            }

            return Unauthorized(new { message = "Code invalide" });
        }

        [HttpPost("set-password")]
        public IActionResult SetAdminPassword([FromBody] PasswordDto dto)
        {
            string connStr = "Server=localhost;Database=easystock;User ID=root;Password=root;";
            try
            {
                using var connection = new MySqlConnection(connStr);
                connection.Open();

                string hashedPassword = BCrypt.Net.BCrypt.HashPassword(dto.Password);

                var command = new MySqlCommand("REPLACE INTO admin_password (id, password) VALUES (1, @password)", connection);
                command.Parameters.AddWithValue("@password", hashedPassword);
                command.ExecuteNonQuery();

                return Ok(new { message = "Mot de passe enregistré" });
            }
            catch (Exception e)
            {
                return StatusCode(500, new { error = e.Message });
            }
        }
    }
}
