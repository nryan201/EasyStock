namespace EasyStock.API.Dtos
{
    public class MouvementDto
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public string MovementType { get; set; } = "IN";
    }
}