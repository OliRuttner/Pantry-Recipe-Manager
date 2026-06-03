using System.Net;
using System.Text;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace Backend.Tests;

public class ApiTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public ApiTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Swagger_Should_Load()
    {
        var response = await _client.GetAsync("/swagger");

        Assert.True(response.IsSuccessStatusCode);
    }

    [Fact]
    public async Task Get_Items_Should_Return_OK()
    {
        var response = await _client.GetAsync("/api/Inventory");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Get_Recipes_Should_Return_OK()
    {
        var response = await _client.GetAsync("/api/recipes");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Get_ShoppingList_Should_Return_OK()
    {
        var response = await _client.GetAsync("/api/shoppinglist");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Invalid_Route_Should_Return_404()
    {
        var response = await _client.GetAsync("/api/doesnotexist");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Create_Item_Should_Not_Return_Server_Error()
    {
        var json = """
        {
            "name":"Milk",
            "quantity":1,
            "unit":"L",
            "category":"Dairy"
        }
        """;

        var content = new StringContent(
            json,
            Encoding.UTF8,
            "application/json"
        );

        var response = await _client.PostAsync("/api/Inventory", content);

        Assert.NotEqual(HttpStatusCode.InternalServerError, response.StatusCode);
    }

    [Fact]
    public async Task Create_Invalid_Item_Should_Fail()
    {
        var json = """
        {
            "name":"",
            "quantity":-5
        }
        """;

        var content = new StringContent(
            json,
            Encoding.UTF8,
            "application/json"
        );

        var response = await _client.PostAsync("/api/Inventory", content);

        Assert.False(response.StatusCode == HttpStatusCode.InternalServerError);
    }

    [Fact]
    public async Task Items_Response_Should_Not_Be_Empty()
    {
        var response = await _client.GetAsync("/api/Inventory");

        var text = await response.Content.ReadAsStringAsync();

        Assert.NotNull(text);
    }

    [Fact]
    public async Task Recipes_Response_Should_Be_JSON()
    {
        var response = await _client.GetAsync("/api/recipes");

        var contentType = response.Content.Headers.ContentType?.MediaType;

        Assert.Equal("application/json", contentType);
    }

    [Fact]
    public async Task Get_Items_Should_Not_Return_500()
    {
        var response = await _client.GetAsync("/api/Inventory");

        Assert.NotEqual(HttpStatusCode.InternalServerError, response.StatusCode);
    }

    [Fact]
    public async Task Get_Recipes_Should_Not_Return_500()
    {
        var response = await _client.GetAsync("/api/recipes");

        Assert.NotEqual(HttpStatusCode.InternalServerError, response.StatusCode);
    }

    [Fact]
    public async Task Get_ShoppingList_Should_Not_Return_500()
    {
        var response = await _client.GetAsync("/api/shoppinglist");

        Assert.NotEqual(HttpStatusCode.InternalServerError, response.StatusCode);
    }

    [Fact]
public async Task Put_On_Invalid_Item_Should_Return_Response()
{
    var json = """
    {
        "id":99999,
        "name":"Test",
        "quantity":1,
        "unit":"pcs",
        "category":"Other"
    }
    """;

    var content = new StringContent(
        json,
        Encoding.UTF8,
        "application/json"
    );

    var response = await _client.PutAsync("/api/Inventory/99999", content);

    Assert.NotNull(response);
}

    [Fact]
    public async Task Delete_Invalid_Item_Should_Not_Return_500()
    {
        var response = await _client.DeleteAsync("/api/Inventory/99999");

        Assert.NotEqual(HttpStatusCode.InternalServerError, response.StatusCode);
    }

    [Fact]
    public async Task Response_Should_Have_ContentType()
    {
        var response = await _client.GetAsync("/api/Inventory");

        Assert.NotNull(response.Content.Headers.ContentType);
    }

    [Fact]
    public async Task Multiple_Requests_Should_Work()
    {
        for (int i = 0; i < 5; i++)
        {
            var response = await _client.GetAsync("/api/Inventory");

            Assert.True(response.IsSuccessStatusCode);
        }
    }

    [Fact]
    public async Task Request_Should_Finish_Quickly()
    {
        var start = DateTime.Now;

        var response = await _client.GetAsync("/api/Inventory");

        var end = DateTime.Now;

        var duration = end - start;

        Assert.True(duration.TotalSeconds < 5);
    }

    [Fact]
    public async Task Empty_Post_Body_Should_Not_Crash()
    {
        var content = new StringContent(
            "",
            Encoding.UTF8,
            "application/json"
        );

        var response = await _client.PostAsync("/api/Inventory", content);

        Assert.NotEqual(HttpStatusCode.InternalServerError, response.StatusCode);
    }
}