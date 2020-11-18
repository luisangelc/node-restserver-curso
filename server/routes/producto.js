const express = require('express');
const { verificarToken } = require('../middlewares/autenticacion');

let app = express();
let Producto = require('../models/producto');

// ===========================
//  Obtener productos
// ===========================
app.get('/productos', verificarToken, (req, res) => {
    // trae todos los productos
    // populate: usuario categoria
    // paginado

    let desde = req.query.desde || 0;
    desde = Number(desde);

    Producto.find({ disponible: true })
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({ IsError: true, Data: null, Message: err });
            }

            if (productos.length === 0) return res.status(400).json({ IsError: false, Data: [], Message: 'No se encontraron productos disponibles' });

            res.json({ IsError: false, Message: 'OK', Data: productos });
        });
});

// ======================
// Obtener un producto por ID
// ======================
app.get('/productos/:id', verificarToken, (req, res) => {
    // populate: usuario categoria
    let id = req.params.id;

    Producto.findById(id)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productoDB) => {
            if (err) {
                return res.status(500).json({ IsError: true, Data: null, Message: err });
            }

            if (!productoDB) {
                return res.status(400).json({ IsError: false, Data: [], Message: 'El Producto no existe' });
            }

            res.json({ IsError: false, Message: 'OK', Data: productoDB });
        });
});

// ======================
// Buscar productos
// ======================
app.get('/productos/buscar/:termino', verificarToken, (req, res) => {
    let termino = req.params.termino;
    let regex = new RegExp(termino, 'i');

    Producto.find({ nombre: regex })
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({ IsError: true, Data: null, Message: err });
            }

            res.json({
                IsError: false, Message: 'OK', Data: productos
            });
        });
});

// ======================
// Crear un nuevo producto
// ======================
app.post('/productos', verificarToken, (req, res) => {
    // grabar el usuario
    // grabar una categoria del listado
    let body = req.body;

    let producto = new Producto({
        usuario: req.usuario._id,
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria
    });

    producto.save((err, productoDB) => {
        if (err) {
            return res.status(500).json({ IsError: true, Data: null, Message: err });
        }

        res.status(201).json({ IsError: false, Data: productoDB, Message: 'OK.' });
    });
});

// ======================
// Actualiza un producto
// ======================
app.put('/productos/:id', verificarToken, (req, res) => {
    // grabar el usuario
    // grabar una categoria del listado
    let id = req.params.id;
    let body = req.body;

    Producto.findById(id, (err, productoDB) => {
        if (err) {
            return res.status(500).json({ IsError: true, Data: null, Message: err });
        }

        if (!productoDB) {
            return res.status(400).json({ IsError: true, Data: null, Message: 'El producto no existe' });
        }

        productoDB.nombre = body.nombre;
        productoDB.precioUni = body.precioUni;
        productoDB.categoria = body.categoria;
        productoDB.disponible = body.disponible;
        productoDB.descripcion = body.descripcion;

        productoDB.save((err, productoGuardado) => {
            if (err) {
                return res.status(500).json({ IsError: true, Data: null, Message: err });
            }

            res.json({
                IsError: false, Message: "OK", Data: productoGuardado
            });
        });

    });
});

// ======================
// Borrar un producto
// ======================
app.delete('/productos/:id', verificarToken, (req, res) => {
    let id = req.params.id;

    Producto.findById(id, (err, productoDB) => {
        if (err) {
            return res.status(500).json({ IsError: true, Data: null, Message: err });
        }

        if (!productoDB) {
            return res.status(400).json({ IsError: true, Data: null, Message: err });
        }

        productoDB.disponible = false;
        productoDB.save((err, productoBorado) => {
            if (err) {
                return res.status(500).json({ IsError: true, Data: null, Message: err });
            }

            res.json({
                IsError: false, Message: 'Producto borrado', Data: productoBorado
            });
        });
    });
});

module.exports = app;