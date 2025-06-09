namespace EasyStock.API.Dtos
{

    public class DeleteWithPasswordDto
    {
        public int ProductId { get; set; }
        public string AdminPassword { get; set; } = string.Empty;
    }


}