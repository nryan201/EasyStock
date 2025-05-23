using MySql.Data.MySqlClient;
using Microsoft.AspNetCore.Mvc;


string connectionString = "Server=localhost;Database=easystock;User ID=root;Password=root;";

using var connection = new MySqlConnection(connectionString);
try
{
    connection.Open();
    Console.WriteLine("Connexion réussie !");
    
    var command = new MySqlCommand("SELECT * FROM product", connection);
    using var reader = command.ExecuteReader();
    while (reader.Read())
    {
        Console.WriteLine($"Produit : {reader["NAME"]}, Stock : {reader["STOCK"]}");
    }
    if (reader.HasRows)
    {
        Console.WriteLine("Des produits ont été trouvés.");
    }
    else
    {
        Console.WriteLine("Aucun produit trouvé.");
    }
}
catch (Exception ex)
{
    Console.WriteLine("Erreur : " + ex.Message);
}