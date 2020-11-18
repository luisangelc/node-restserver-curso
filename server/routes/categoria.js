const express = require('express');

let { verificarToken, verificaAdmin_Role } = require('../middlewares/autenticacion');
let app = express();
let Categoria = require('../models/categoria');

//=============================
// Mostrar todas las categorias
//=============================
app.get('/categoria', verificarToken, (req, res) => {
    // .sort('descripcion') = ASC
    // .sort('-descripcion') = DESC
    Categoria.find({})
        .sort('descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, categorias) => {
            if (err) {
                return res.status(500).json({ IsError: true, Message: err, Data: null });
            }
    
            res.json({ ok: true, categorias });
        });
});

//=============================
// Mostrar una categoria por id
//=============================
app.get('/categoria/:id', verificarToken, (req, res) => {
    let id = req.params.id;

    Categoria.findById(id, (err, categoriaDB) => {
        if (err) {
            return res.status(500).json({ IsError: true, Message: err, Data: null });
        }

        if (!categoriaDB) {
            return res.status(400).json({ IsError: false, Message: 'El ID no es correcto', Data: null });
        }

        res.json({ ok: true, categoriaDB });
    });
});

//=============================
// Crear una nueva categoria
//=============================
app.post('/categoria', verificarToken, (req, res) => {
    // regresa una nueva categoria
    let body = req.body;

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    });

    categoria.save((err, categoriaDB) => {
        if (err) {
            return res.status(500).json({ IsError: true, Message: err, Data: null });
        }

        if (!categoriaDB) {
            if (err) {
                return res.status(400).json({ IsError: true, Message: err, Data: null });
            }
        }

        res.json({
            IsError: false, Data: categoriaDB, Message: 'OK'
        });
    });
});

//=============================
// Actualiza una nueva categoria
//=============================
app.put('/categoria/:id', verificarToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;
    let descCategoria = {
        descripcion: body.descripcion
    };

    Categoria.findByIdAndUpdate(id, descCategoria, { new: true, runValidators: true }, (err, categoriaDB) => {
        if (err) {
            return res.status(500).json({ IsError: true, Message: err, Data: null });
        }

        if (!categoriaDB) {
            if (err) {
                return res.status(400).json({ IsError: true, Message: err, Data: null });
            }
        }

        res.json({
            IsError: false, Data: categoriaDB, Message: 'OK'
        });
    });
});

app.delete('/categoria/:id', [verificarToken, verificaAdmin_Role], verificarToken, (req, res) => {
    // Solo un administrador puede borrar categorias
    let id = req.params.id;

    Categoria.findByIdAndRemove(id, (err, categoriaDB) => {
        if (err) {
            return res.status(500).json({ IsError: true, Message: err, Data: null });
        }

        if (!categoriaDB) {
            if (err) {
                return res.status(400).json({ IsError: true, Message: 'El id no existe', Data: null });
            }
        }

        res.json({
            IsError: false, Data: [], Message: 'OK. Categoria Borrada'
        })
    });
});

module.exports = app;