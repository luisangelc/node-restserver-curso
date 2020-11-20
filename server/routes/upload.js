const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const path = require('path');
const app = express();

const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

// default options
app.use(fileUpload());

app.put('/upload/:tipo/:id', (req, res) => {
    let tipo = req.params.tipo;
    let id = req.params.id;

    if (!req.files)
        return res.status(400).json({ IsError: true, Data: null, Message: 'No se ha seleccionado ningún archivo' });
    
    let tiposValidos = ['productos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0)
        return res.status(400).json({ IsError: true, Data: null, Message: 'Los tipos permitidas son ' + tiposValidos.join(', ') });

    let archivo = req.files.archivo;
    // Extensiones permitidas
    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];
    let nomberCortado = archivo.name.split('.');
    let extension = nomberCortado[nomberCortado.length -1];

    if (extensionesValidas.indexOf(extension) < 0)
        return res.status(400).json({ IsError: true, Data: extension, Message: 'Las extensiones permitidas son ' + extensionesValidas.join(', ') });
    
    // Cambiar el nombre al archivo
    let nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extension }`;

    archivo.mv(`uploads/${ tipo }/${ nombreArchivo }`, (err) => {
        if (err)
            return res.status(500).json({ IsError: true, Data: null, Message: err });

        // Aquí, imagen cargada.
        if (tipo === 'usuarios') 
            imagenUsuario(id, res, nombreArchivo);
        else
            imagenProducto(id, res, nombreArchivo);
    });
});

function imagenUsuario(id, res, nombreArchivo) {
    Usuario.findById(id, (err, usuarioDB) => {
        if (err) {
            borraArchivo(nombreArchivo, 'usuarios');
            return res.status(500).json({ IsError: false, Data: {}, Message: 'Usuario no existe.' });
        }

        if (!usuarioDB) {
            borraArchivo(nombreArchivo, 'usuarios');
            return res.status(400).json({ IsError: true, Data: null, Message: err });
        }

        borraArchivo(usuarioDB.img, 'usuarios');

        usuarioDB.img = nombreArchivo;
        usuarioDB.save((err, usuarioGuardado) => {
            res.json({ IsError: false, Data: usuarioGuardado, Message: `Imagen ${ nombreArchivo } subida correctamente` });
        });
    });
}

function imagenProducto(id, res, nombreArchivo) {
    Producto.findById(id, (err, productoDB) => {
        if (err) {
            borraArchivo(nombreArchivo, 'productos');
            return res.status(500).json({ IsError: false, Data: {}, Message: 'Producto no existe.' });
        }

        if (!productoDB) {
            borraArchivo(nombreArchivo, 'productos');
            return res.status(400).json({ IsError: true, Data: null, Message: err });
        }

        borraArchivo(productoDB.img, 'productos');

        productoDB.img = nombreArchivo;
        productoDB.save((err, productoGuardado) => {
            res.json({ IsError: false, Data: productoGuardado, Message: `Imagen ${ nombreArchivo } subida correctamente` });
        });
    });
}

function borraArchivo(nombreImg, tipo) {
    let pathImg = path.resolve(__dirname, `../../uploads/${ tipo }/${ nombreImg }`);
    if (fs.existsSync(pathImg))
        fs.unlinkSync(pathImg);
}

module.exports = app;