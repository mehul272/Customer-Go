Node - Create following APIs
GET -> Customer GET -> Orders (A customer can have N number of Orders) GET -> Products (An order can have N number of products, please maintain SKU id to identify identical products)
POST/PATCH -> Products update (Updating products based on ID, A product can have N number of quantity) POST/PATCH -> Order Update

Relationships
Orders and Products 1 – Many
Customer and Orders 1 – Many

For Product POST/PATCH API, the user can update quantity as well as status(Processing, Done) of the product
