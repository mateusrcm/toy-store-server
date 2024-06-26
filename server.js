const jsonServer = require("json-server");
const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

server.post("/products_with_images", (req, res, next) => {
	const resource = update(req);

	if (resource) {
		res.locals.data = resource;
	}

	next();
});

server.patch("/products_with_images/:id", (req, res, next) => {
	const resource = update(req);

	if (resource) {
		res.locals.data = resource;
	}

	next();
});

server.put("/products_with_images/:id", (req, res, next) => {
	const resource = update(req);

	if (resource) {
		res.locals.data = resource;
	}

	next();
});

function update(req) {
	const db = router.db; // Assign the lowdb instance
	const images = req.body.product_images;

	delete req.body.product_images;

	const product = insert(req, req.body, "products"); // Add product
	const imagesInDb = db
		.get("product_images")
		.filter((img) => img.productId === product.id);

	const removedImages = imagesInDb.filter(
		(img) => !images.some((image) => img.id === image.id)
	);

	removedImages.forEach((image) => {
		db.get("product_images").removeById(image.id).value();
	});

	product.product_images = images.map((image) => {
		const img = insert(
			req,
			{ productId: product.id, ...image },
			"product_images"
		); // Add product images

		return img;
	});

	return product;
}

function insert(req, data, name) {
	const db = router.db; // Assign the lowdb instance
	let chain = db.get(name);

	if (data.id) {
		const chainByMethod = {
			PATCH: chain.updateById(data.id, data),
			PUT: chain.replaceById(data.id, data),
		};

		chain = chainByMethod[req.method];
	} else {
		chain = chain.insert(data);
	}

	return chain.value();
}

server.use(router);
server.listen(3000, () => {
	console.log("JSON Server is running");
});
