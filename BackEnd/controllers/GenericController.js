import { getModel } from '../utils/modelMapper.js';

// Middleware to get the model for the route
export const getModelByName = (req, res, next) => {
    try {
        req.Model = getModel(req.params.model);
        next();
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

export const getAll = async (req, res) => {
    try {
        const { Model } = req;
        const data = await Model.findAll();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: `Erro ao obter ${req.params.model}`, error: error.message });
    }
};

export const getById = async (req, res) => {
    try {
        const { Model } = req;
        const { id } = req.params;
        const record = await Model.findByPk(id);
        if (record) {
            res.status(200).json(record);
        } else {
            res.status(404).json({ message: `${req.params.model} não encontrado` });
        }
    } catch (error) {
        res.status(500).json({ message: `Erro ao obter ${req.params.model}`, error: error.message });
    }
};

export const create = async (req, res) => {
    try {
        const { Model } = req;
        const newRecord = await Model.create(req.body);
        res.status(201).json(newRecord);
    } catch (error) {
        res.status(500).json({ message: `Erro ao criar ${req.params.model}`, error: error.message });
    }
};

export const update = async (req, res) => {
    try {
        const { Model } = req;
        const { id } = req.params;
        const [updated] = await Model.update(req.body, { where: { id } });
        if (updated) {
            const record = await Model.findOne({ where: { id } });
            res.status(200).json(record);
        } else {
            res.status(404).json({ message: `${req.params.model} não encontrado` });
        }
    } catch (error) {
        res.status(500).json({ message: `Erro ao atualizar ${req.params.model}`, error: error.message });
    }
};

export const remove = async (req, res) => {
    try {
        const { Model } = req;
        const { id } = req.params;
        const deleted = await Model.destroy({ where: { id } });
        if (deleted) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: `${req.params.model} não encontrado` });
        }
    } catch (error) {
        res.status(500).json({ message: `Erro ao deletar ${req.params.model}`, error: error.message });
    }
};
