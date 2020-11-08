const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('underscore');

const Usuario = require('../models/usuario');

const app = express();

app.get('/usuario', function (req, res) {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    Usuario.find({ estado: true }, 'nombre email role estado google img')
        .skip(desde)    // para obtener los siguiente 5
        .limit(limite)   // paginado
        .exec((err, usuarios) => {
            if (err) {
                return res.status(400).json({
                    IsError: !0, Message: err, Data: null,
                });
            }
            
            Usuario.count({ /*google: true*/ estado: true }, (err, conteo) => {
                res.json({
                    IsError: !1,
                    Message: "Users found " + usuarios.length,
                    Cuanteo: conteo,
                    Data: usuarios
                });
            });
        });
});

app.post('/usuario', function (req, res) {
    let body = req.body;
    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });

    usuario.save((err, usuarioDB) => {
        if (err) {
            if (err) {
                return res.status(400).json({
                    IsError: !0, Message: err, Data: null,
                });
            }
        }

        //usuarioDB.password = null;

        res.json({
            IsError: !1,
            Message: "User saved successfully",
            Data: usuarioDB
        });

    });
});

app.put('/usuario/:id', function (req, res) {
    let id = req.params.id;
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);

    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                IsError: !0, Message: err, Data: null,
            });
        }

        res.json({
            IsError: !1,
            Message: "User updated successfully",
            Data: usuarioDB
        });

    });
});

app.delete('/usuario/:id', function (req, res) {
    let id = req.params.id;
    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(400).json({
                IsError: !0, Message: err, Data: null,
            });
        }

        if (!usuarioBorrado) {
            return res.status(404).json({
                IsError: !1, Message: `ID ${ id } user not found`, Data: null,
            });
        }

        res.json({
            IsError: !1,
            Message: "User removed successfully",
            Data: usuarioBorrado
        })
    });
});

app.delete('/usuariolgc/:id', function (req, res) {
    let id = req.params.id;
    let cambiaEstado = { estado: false };

    Usuario.findByIdAndUpdate(id, cambiaEstado, { new: true }, (err, usuarioBorrado) => {
        if (err) {
            return res.status(400).json({
                IsError: !0, Message: err, Data: null,
            });
        }

        if (!usuarioBorrado) {
            return res.status(404).json({
                IsError: !1, Message: `ID ${ id } user not found`, Data: null,
            });
        }

        res.json({
            IsError: !1,
            Message: "User removed successfully",
            Data: usuarioBorrado
        });
    });
});

module.exports = app;