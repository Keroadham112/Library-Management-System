# Northstar Market 🛍️

A full-stack inventory management system and electronics storefront built with React, TypeScript, ASP.NET Core Web API, Entity Framework Core, and SQLite.

Northstar Market combines an administrative dashboard for managing business operations with a customer-facing storefront for browsing products and managing a shopping cart.

## ✨ Features

### 🛒 Customer Storefront
- Modern, responsive electronics storefront.
- Browse products and categories.
- Search and filter products.
- View product details.
- Add products to the shopping cart.
- Update quantities and remove items.
- Persist cart contents using browser local storage.
- Local product images served by the backend.
- Fallback images for missing product images.
- Light Mode and Dark Mode support.

### 📦 Inventory Management
- Manage products and categories.
- Manage suppliers and customers.
- Track stock and product prices.
- Manage purchases and sales.
- View business information through the admin dashboard.

### 🔐 Authentication and Authorization
- Authenticated administrative access.
- Role-based authorization for protected operations.
- Public access to supported storefront catalog endpoints.

### 🖥️ Admin Dashboard
- Dashboard for managing inventory and business data.
- Dedicated management sections for products, categories, suppliers, customers, purchases, and sales.
- Navigation between the admin dashboard and customer storefront.

## 🧰 Tech Stack

**Frontend**
- React
- TypeScript
- Vite
- Axios
- CSS

**Backend**
- ASP.NET Core Web API
- C#
- Entity Framework Core
- SQLite
- RESTful API architecture

**Development Tools**
- Visual Studio Code
- Git and GitHub

## 🏗️ Architecture

The project separates the frontend from the backend:

- **Frontend:** Provides the storefront and administrative user interface.
- **Backend API:** Handles application requests and business logic.
- **Database:** SQLite stores application data.
- **Local Assets:** Product images are served from the backend's static files directory.

Example local product image path:

`/images/products/ht-audio-001.jpg`

## 📁 Project Structure

The exact folder names may vary depending on the current repository structure.

```text
Northstar-Market/
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── Controllers/
│   ├── Models/
│   ├── DTOs/
│   ├── Services/
│   ├── Data/
│   ├── wwwroot/
│   │   └── images/
│   │       └── products/
│   └── Program.cs
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites

Install the following tools before running the project:

- Node.js and npm
- .NET SDK compatible with the backend project
- Git

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd Northstar-Market
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with the actual GitHub repository URL.

### 2. Run the Backend

Navigate to the backend project directory:

```bash
cd backend
dotnet restore
dotnet run
```

Use the actual directory containing your `.csproj` file if it differs from `backend`.

Keep the backend terminal running and note the API address printed in the terminal.

### 3. Run the Frontend

Open another terminal and navigate to the frontend directory:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite in your browser.

> **Note:** Ensure the frontend API base URL matches the backend address and that the required CORS configuration is enabled.

## 🖼️ Local Product Images

Product images are stored locally in the project and served by ASP.NET Core static file hosting.

- Images are organized under `wwwroot/images/products/`.
- Product records reference local image paths.
- A local fallback image is available for missing or invalid images.
- The storefront is designed to avoid relying on external product image URLs at runtime.

Ensure local image files are included in the repository when committing changes.

## 🗄️ Database

The application uses SQLite with Entity Framework Core.

The existing database should be preserved when running the application or seeding catalog data. Follow the project's existing migration and seeding instructions; do not delete or recreate the database to add products.

## 🧪 Validation

Before submitting changes, verify that:

- The backend builds successfully.
- The frontend builds successfully.
- Product and category data load correctly.
- Local product images display correctly.
- The shopping cart works as expected.
- Admin authentication and protected operations remain functional.
- Both Light Mode and Dark Mode work correctly.

## 🔮 Future Improvements

Potential future enhancements include:

- Completing the customer checkout workflow.
- Integrating storefront orders with the existing sales system.
- Improving product image coverage and consistency.
- Adding order history and customer order tracking.
- Expanding automated testing and deployment workflows.

## 👨‍💻 Author

**Kerolos Adham Amir**

Computer Science student interested in full-stack development, backend engineering, and practical software projects.

## 📄 License

No license has been specified yet. Add a `LICENSE` file if you intend to distribute the project under an open-source license.
