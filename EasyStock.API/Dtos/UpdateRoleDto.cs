namespace EasyStock.API.Dtos
{

    public class UpdateRoleDto
    {
        public int UserId { get; set; }
        public string Role { get; set; } = string.Empty;
    }
}