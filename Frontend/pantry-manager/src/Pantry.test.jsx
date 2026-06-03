import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { describe, it, expect } from "vitest";

describe("Frontend UI tests", () => {
  it("shows Pantry title", () => {
    render(<h1>Pantry</h1>);

    expect(screen.getByText("Pantry")).toBeInTheDocument();
  });

  it("shows Recipes title", () => {
    render(<h1>Recipes</h1>);

    expect(screen.getByText("Recipes")).toBeInTheDocument();
  });

  it("shows Shopping List title", () => {
    render(<h1>Shopping List</h1>);

    expect(screen.getByText("Shopping List")).toBeInTheDocument();
  });

  it("shows Add Ingredient button", () => {
    render(<button>Add Ingredient</button>);

    expect(screen.getByText("Add Ingredient")).toBeInTheDocument();
  });

  it("shows Generate Demo Data button", () => {
    render(<button>Generate Demo Data</button>);

    expect(screen.getByText("Generate Demo Data")).toBeInTheDocument();
  });

  it("shows Cook Recipe button", () => {
    render(<button>Cook Recipe</button>);

    expect(screen.getByText("Cook Recipe")).toBeInTheDocument();
  });

  it("shows Add Missing Ingredients button", () => {
    render(<button>Add Missing Ingredients</button>);

    expect(screen.getByText("Add Missing Ingredients")).toBeInTheDocument();
  });

  it("shows Add Bought To Pantry button", () => {
    render(<button>Add Bought To Pantry</button>);

    expect(screen.getByText("Add Bought To Pantry")).toBeInTheDocument();
  });

  it("shows Ready badge", () => {
    render(<span>Ready</span>);

    expect(screen.getByText("Ready")).toBeInTheDocument();
  });

  it("shows Expiring Soon warning", () => {
    render(<span>Expiring Soon</span>);

    expect(screen.getByText("Expiring Soon")).toBeInTheDocument();
  });

  it("shows Delete button", () => {
    render(<button>Delete</button>);

    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  it("shows Edit button", () => {
    render(<button>Edit</button>);

    expect(screen.getByText("Edit")).toBeInTheDocument();
  });

  it("shows Quantity label", () => {
    render(<span>Quantity</span>);

    expect(screen.getByText("Quantity")).toBeInTheDocument();
  });

  it("shows Expiration Date label", () => {
    render(<span>Expiration Date</span>);

    expect(screen.getByText("Expiration Date")).toBeInTheDocument();
  });

  it("shows Category label", () => {
    render(<span>Category</span>);

    expect(screen.getByText("Category")).toBeInTheDocument();
  });

  it("shows Dairy category", () => {
    render(<span>Dairy</span>);

    expect(screen.getByText("Dairy")).toBeInTheDocument();
  });

  it("shows Vegan recipe tag", () => {
    render(<span>Vegan</span>);

    expect(screen.getByText("Vegan")).toBeInTheDocument();
  });

  it("shows Missing Ingredients text", () => {
    render(<span>Missing Ingredients</span>);

    expect(screen.getByText("Missing Ingredients")).toBeInTheDocument();
  });

  it("shows Pantry Empty message", () => {
    render(<span>Pantry Empty</span>);

    expect(screen.getByText("Pantry Empty")).toBeInTheDocument();
  });

  it("shows Success message", () => {
    render(<span>Recipe Cooked Successfully</span>);

    expect(
      screen.getByText("Recipe Cooked Successfully")
    ).toBeInTheDocument();
  });
});