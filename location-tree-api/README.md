Location Tree API

A Node.js RESTful API for managing a tree structure of locations. This API allows you to add, update, delete, move, and reorder nodes in a hierarchical structure. It is built using Express and SQLite.

Features
- Fetch the entire tree or a specific node along with its children.
- Add new child nodes to a specified parent node.
- Update existing nodes.
- Delete a node and all its descendants.
- Move a node to a new parent.
- Reorder nodes within the same parent.

Requirements
- Node.js (v12 or higher)
- npm (Node package manager)

Setup Instructions

1 Clone the repository

```bash
git clone <https://github.com/PeroSkarpa/Pinecone.git>
cd location-tree-api

2 Install dependencies

npm install

3 Run the API

node app.js

4 Testing the API

Import the Postman Collection
Open Postman.
Click on Import.
Select the Postman collection file (location-tree-api.postman_collection.json) included in this repository.
Once imported, you'll see a list of pre-configured requests for all the API endpoints.