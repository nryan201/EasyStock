using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;
using EasyStock.API.Dtos;

namespace EasyStock.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MouvementsController : ControllerBase
    {
        // 🔐 JWT requis pour créer un mouvement
        [Authorize]
        [HttpPost]
        public IActionResult Create([FromBody] MouvementDto mouvement)
        {
            string connStr = "Server=localhost;Database=easystock;User ID=root;Password=root;";
            try
            {
                using var connection = new MySqlConnection(connStr);
                connection.Open();
                var command = new MySqlCommand(
                    @"INSERT INTO mouvements (PRODUCT_ID, QUANTITY, MOVEMENT_TYPE, MOVEMENT_DATE)
                      VALUES (@productId, @quantity, @movementType, NOW())", connection);

                command.Parameters.AddWithValue("@productId", mouvement.ProductId);
                command.Parameters.AddWithValue("@quantity", mouvement.Quantity);
                command.Parameters.AddWithValue("@movementType", mouvement.MovementType);
                command.ExecuteNonQuery();

                return Ok(new { message = "Mouvement enregistré" });
            }
            catch (Exception e)
            {
                return StatusCode(500, new { error = e.Message });
            }
        }

        // 🔓 Lecture publique
        [AllowAnonymous]
        [HttpGet("evolution-global")]
        public IActionResult GetGlobalStockEvolution()
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
                    ORDER BY MOVEMENT_DATE", connection);

                using var reader = command.ExecuteReader();
                int stock = 0;

                while (reader.Read())
                {
                    var type = reader["MOVEMENT_TYPE"].ToString();
                    var qty = Convert.ToInt32(reader["QUANTITY"]);

                    stock += (type == "IN") ? qty : -qty;

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

        // 🔓 Lecture publique
        [AllowAnonymous]
        [HttpGet("by-category/{categoryId}")]
        public IActionResult GetMouvementsByCategory(int categoryId)
        {
            string connStr = "Server=localhost;Database=easystock;User ID=root;Password=root;";
            var mouvements = new List<object>();

            try
            {
                using var connection = new MySqlConnection(connStr);
                connection.Open();

                var command = new MySqlCommand(@"
                    SELECT m.MOVEMENT_DATE, 
                           m.MOVEMENT_TYPE, 
                           m.QUANTITY
                    FROM mouvements m
                    JOIN product p ON m.PRODUCT_ID = p.ID
                    WHERE p.CATEGORY_ID = @categoryId
                    ORDER BY m.MOVEMENT_DATE", connection);

                command.Parameters.AddWithValue("@categoryId", categoryId);

                using var reader = command.ExecuteReader();
                while (reader.Read())
                {
                    mouvements.Add(new
                    {
                        date = Convert.ToDateTime(reader["MOVEMENT_DATE"]).ToString("yyyy-MM-dd"),
                        type = reader["MOVEMENT_TYPE"].ToString(),
                        quantity = Convert.ToInt32(reader["QUANTITY"])
                    });
                }

                return Ok(mouvements);
            }
            catch (Exception e)
            {
                return StatusCode(500, new { error = e.Message });
            }
        }
    }
}
