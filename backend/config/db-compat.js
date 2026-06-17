const { Sequelize, DataTypes, Op } = require('sequelize');
const dotenv = require('dotenv');

// Load env variables
dotenv.config();

const dbUri = process.env.DATABASE_URL || process.env.POSTGRES_URI || process.env.MONGODB_URI;

if (!dbUri) {
  console.error('❌ No database connection URI found in environment variables.');
  process.exit(1);
}

console.log('🔌 Connecting to PostgreSQL using URI:', dbUri.split('@')[1] || dbUri); // log without credentials

const sequelize = new Sequelize(dbUri, {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'production' ? false : console.log,
  dialectOptions: {
    ...(dbUri.includes('sslmode=require') || dbUri.includes('ssl=true') ? {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    } : {})
  }
});

// Define PostgreSQL models
const User = sequelize.define('User', {
  _id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: 'owner'
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'available'
  },
  vehicleType: DataTypes.STRING,
  vehiclePlate: DataTypes.STRING,
  vehicleModel: DataTypes.STRING,
  vehicleCategory: DataTypes.STRING,
  trailerPlate: DataTypes.STRING,
  currentLocation: DataTypes.STRING,
  phone: DataTypes.STRING,
  avatar: DataTypes.STRING,
  vehicleImage: DataTypes.TEXT,
  isApproved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: true,
  hooks: {
    beforeSave: async (user) => {
      if (user.isNewRecord || user.changed('password')) {
        const pw = user.password;
        if (pw && !pw.startsWith('$2a$') && !pw.startsWith('$2b$')) {
          const bcrypt = require('bcryptjs');
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(pw, salt);
        }
      }
    }
  }
});

const Cargo = sequelize.define('Cargo', {
  _id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  description: DataTypes.TEXT,
  category: DataTypes.STRING,
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  timestamps: true
});

const Feature = sequelize.define('Feature', {
  _id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  icon: DataTypes.STRING,
  category: {
    type: DataTypes.STRING,
    defaultValue: 'core-value'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  timestamps: true
});

const Statistic = sequelize.define('Statistic', {
  _id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  label: {
    type: DataTypes.STRING,
    allowNull: false
  },
  value: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  timestamps: true
});

const Shipment = sequelize.define('Shipment', {
  _id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  trackingId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  ownerId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  driverId: DataTypes.UUID,
  origin: {
    type: DataTypes.STRING,
    allowNull: false
  },
  destination: {
    type: DataTypes.STRING,
    allowNull: false
  },
  pickupContactPerson: DataTypes.STRING,
  pickupContactPhone: DataTypes.STRING,
  deliveryContactPerson: DataTypes.STRING,
  deliveryContactPhone: DataTypes.STRING,
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending'
  },
  cargoType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  weight: DataTypes.STRING,
  quantity: DataTypes.INTEGER,
  description: DataTypes.TEXT,
  dimensions: DataTypes.JSONB,
  specialInstructions: DataTypes.TEXT,
  incidentNote: DataTypes.TEXT,
  pickupDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  statusHistory: {
    type: DataTypes.JSONB,
    defaultValue: []
  }
}, {
  timestamps: true
});

const Conversation = sequelize.define('Conversation', {
  _id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  participants: {
    type: DataTypes.ARRAY(DataTypes.UUID),
    allowNull: false,
    defaultValue: []
  },
  isGroup: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  name: DataTypes.STRING,
  groupAdmin: DataTypes.UUID
}, {
  timestamps: true
});

const Message = sequelize.define('Message', {
  _id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  conversationId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  sender: {
    type: DataTypes.UUID,
    allowNull: false
  },
  recipient: {
    type: DataTypes.UUID,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  readAt: DataTypes.DATE,
  attachments: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  reactions: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  replyTo: DataTypes.JSONB
}, {
  timestamps: true,
  indexes: [
    { fields: ['conversationId', 'createdAt'] },
    { fields: ['recipient', 'read'] }
  ]
});

const Payment = sequelize.define('Payment', {
  _id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  shipmentId: DataTypes.UUID,
  amount: {
    type: DataTypes.DOUBLE,
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'ZMW'
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending'
  },
  payer: {
    type: DataTypes.STRING,
    allowNull: false
  },
  payee: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: true
});

const JobPost = sequelize.define('JobPost', {
  _id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  origin: {
    type: DataTypes.STRING,
    allowNull: false
  },
  destination: {
    type: DataTypes.STRING,
    allowNull: false
  },
  budget: DataTypes.DOUBLE,
  pickupDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'open'
  },
  postedBy: {
    type: DataTypes.UUID,
    allowNull: false
  },
  reactions: {
    type: DataTypes.JSONB,
    defaultValue: []
  }
}, {
  timestamps: true
});

// Helper: Query Translator
function mongoToSequelizeQuery(mongoQuery) {
  if (!mongoQuery) return {};
  const sequelizeQuery = {};

  for (let key of Object.keys(mongoQuery)) {
    let val = mongoQuery[key];

    // Normalize keys: mapping id to _id
    let normKey = key === 'id' ? '_id' : key;

    if (normKey === '$or') {
      sequelizeQuery[Op.or] = val.map(mongoToSequelizeQuery);
      continue;
    }

    if (normKey === '$and') {
      sequelizeQuery[Op.and] = val.map(mongoToSequelizeQuery);
      continue;
    }

    if (val && typeof val === 'object' && !Array.isArray(val) && !(val instanceof RegExp)) {
      const innerKeys = Object.keys(val);
      const condition = {};

      for (let op of innerKeys) {
        const opVal = val[op];
        if (op === '$in') {
          condition[Op.in] = opVal;
        } else if (op === '$nin') {
          condition[Op.notIn] = opVal;
        } else if (op === '$gt') {
          condition[Op.gt] = opVal;
        } else if (op === '$gte') {
          condition[Op.gte] = opVal;
        } else if (op === '$lt') {
          condition[Op.lt] = opVal;
        } else if (op === '$lte') {
          condition[Op.lte] = opVal;
        } else if (op === '$ne') {
          condition[Op.ne] = opVal;
        } else if (op === '$all') {
          condition[Op.contains] = opVal;
        } else if (op === '$regex') {
          let pattern = opVal;
          if (pattern instanceof RegExp) {
            pattern = pattern.source;
          }
          if (pattern.startsWith('^') && pattern.endsWith('$')) {
            condition[Op.iLike] = pattern.slice(1, -1);
          } else {
            condition[Op.iRegexp] = pattern;
          }
        } else {
          condition[op] = opVal;
        }
      }
      sequelizeQuery[normKey] = condition;
    } else if (val instanceof RegExp) {
      sequelizeQuery[normKey] = { [Op.iRegexp]: val.source };
    } else {
      // In PostgreSQL, array checking requires Op.contains for ARRAY columns
      if (normKey === 'participants') {
        sequelizeQuery[normKey] = { [Op.contains]: [val] };
      } else {
        sequelizeQuery[normKey] = val;
      }
    }
  }

  return sequelizeQuery;
}

// Helper: Populate Loader
async function populateHelper(docs, path, select) {
  if (!docs || docs.length === 0) return;

  let targetModelName = null;
  let isArray = false;

  const firstDoc = docs[0];
  const modelName = firstDoc.__modelName;

  if (modelName === 'Message') {
    if (path === 'sender' || path === 'recipient') targetModelName = 'User';
    if (path === 'conversationId') targetModelName = 'Conversation';
  } else if (modelName === 'JobPost') {
    if (path === 'postedBy') targetModelName = 'User';
  } else if (modelName === 'Conversation') {
    if (path === 'participants') {
      targetModelName = 'User';
      isArray = true;
    }
  }

  if (!targetModelName) {
    if (path === 'ownerId' || path === 'driverId') targetModelName = 'User';
    else return;
  }

  const targetModel = module.exports[targetModelName];
  if (!targetModel) return;

  const ids = new Set();
  for (let doc of docs) {
    const val = doc[path];
    if (isArray && Array.isArray(val)) {
      for (let id of val) {
        if (id) ids.add(id.toString());
      }
    } else if (val) {
      ids.add(val.toString());
    }
  }

  if (ids.size === 0) return;

  const targetDocs = await targetModel.find({ _id: { $in: Array.from(ids) } });

  const targetMap = {};
  for (let tDoc of targetDocs) {
    let data = tDoc.toObject();
    if (select) {
      const fields = select.split(/\s+/).filter(Boolean);
      if (fields.length > 0) {
        const filtered = { _id: data._id };
        for (let f of fields) {
          if (!f.startsWith('-')) {
            const cleanF = f.startsWith('+') ? f.substring(1) : f;
            filtered[cleanF] = data[cleanF];
          }
        }
        data = filtered;
      }
    }
    targetMap[tDoc._id.toString()] = data;
  }

  for (let doc of docs) {
    const val = doc[path];
    if (isArray && Array.isArray(val)) {
      doc[path] = val.map(id => targetMap[id.toString()] || id);
    } else if (val) {
      doc[path] = targetMap[val.toString()] || val;
    }
  }
}

// Helper: Wrap Document
function wrapDocument(sequelizeInstance, modelName) {
  if (!sequelizeInstance) return null;

  const doc = {
    __modelName: modelName,
    __instance: sequelizeInstance,
  };

  const rawData = sequelizeInstance.get({ plain: true });
  Object.assign(doc, rawData);

  doc.id = rawData._id ? rawData._id.toString() : null;

  doc.isModified = function (field) {
    return sequelizeInstance.changed(field);
  };

  doc.save = async function () {
    const columns = Object.keys(sequelizeInstance.rawAttributes);
    for (let col of columns) {
      if (col in doc) {
        sequelizeInstance.set(col, doc[col]);
      }
    }
    await sequelizeInstance.save();

    const updatedRaw = sequelizeInstance.get({ plain: true });
    Object.assign(doc, updatedRaw);
    doc.id = updatedRaw._id ? updatedRaw._id.toString() : null;
    return doc;
  };

  doc.deleteOne = async function () {
    return await sequelizeInstance.destroy();
  };

  doc.remove = async function () {
    return await sequelizeInstance.destroy();
  };

  doc.toObject = function () {
    const obj = { ...doc };
    delete obj.__modelName;
    delete obj.__instance;
    delete obj.isModified;
    delete obj.save;
    delete obj.deleteOne;
    delete obj.remove;
    delete obj.toObject;
    delete obj.toJSON;
    delete obj.populate;
    return obj;
  };

  doc.toJSON = function () {
    return doc.toObject();
  };

  doc.populate = async function (path, select) {
    if (typeof path === 'string') {
      await populateHelper([doc], path, select);
    } else if (typeof path === 'object') {
      await populateHelper([doc], path.path, path.select);
    }
    return doc;
  };

  return doc;
}

// Model constructor wrapper
function createModelWrapper(sequelizeModel, modelName) {
  function Model(data = {}) {
    const instance = sequelizeModel.build(data);
    return wrapDocument(instance, modelName);
  }

  Model.sequelizeModel = sequelizeModel;
  Model.modelName = modelName;

  Model.find = function(filter = {}) {
    return new QueryWrapper(this, 'find', filter);
  };

  Model.findOne = function(filter = {}) {
    return new QueryWrapper(this, 'findOne', filter);
  };

  Model.findById = function(id) {
    return new QueryWrapper(this, 'findById', id);
  };

  Model.findByIdAndUpdate = function(id, update, options = {}) {
    return new QueryWrapper(this, 'findByIdAndUpdate', { id, update, options });
  };

  Model.findByIdAndDelete = function(id) {
    return new QueryWrapper(this, 'findByIdAndDelete', id);
  };

  Model.findOneAndDelete = function(filter) {
    return new QueryWrapper(this, 'findOneAndDelete', filter);
  };

  Model.findOneAndUpdate = function(filter, update, options = {}) {
    return new QueryWrapper(this, 'findOneAndUpdate', { filter, update, options });
  };

  Model.countDocuments = async function(filter = {}) {
    const where = mongoToSequelizeQuery(filter);
    return await sequelizeModel.count({ where });
  };

  Model.deleteMany = async function(filter = {}) {
    const where = mongoToSequelizeQuery(filter);
    return await sequelizeModel.destroy({ where });
  };

  Model.deleteOne = async function(filter = {}) {
    const where = mongoToSequelizeQuery(filter);
    const record = await sequelizeModel.findOne({ where });
    if (record) {
      await record.destroy();
      return { deletedCount: 1 };
    }
    return { deletedCount: 0 };
  };

  Model.updateMany = async function(filter = {}, update = {}, options = {}) {
    const where = mongoToSequelizeQuery(filter);
    const values = update.$set ? update.$set : update;
    const [affectedCount] = await sequelizeModel.update(values, { where });
    return { matchedCount: affectedCount, modifiedCount: affectedCount };
  };

  Model.create = async function(data) {
    if (Array.isArray(data)) {
      return this.insertMany(data);
    }
    const record = await sequelizeModel.create(data);
    return wrapDocument(record, modelName);
  };

  Model.insertMany = async function(arr) {
    const records = await sequelizeModel.bulkCreate(arr);
    return records.map(r => wrapDocument(r, modelName));
  };

  return Model;
}

// Query Wrapper for chaining methods
class QueryWrapper {
  constructor(modelCompat, op, arg) {
    this.modelCompat = modelCompat;
    this.op = op;
    this.arg = arg;
    this.populateCalls = [];
    this.sortCall = null;
    this.selectCall = null;
    this.limitCall = null;
    this.skipCall = null;
  }

  populate(path, select) {
    this.populateCalls.push({ path, select });
    return this;
  }

  sort(sortObj) {
    this.sortCall = sortObj;
    return this;
  }

  select(fields) {
    this.selectCall = fields;
    return this;
  }

  limit(n) {
    this.limitCall = n;
    return this;
  }

  skip(n) {
    this.skipCall = n;
    return this;
  }

  async exec() {
    let result;
    const { sequelizeModel, modelName } = this.modelCompat;
    const queryOptions = {};

    if (this.selectCall) {
      let attributes = null;
      if (typeof this.selectCall === 'string') {
        const fields = this.selectCall.split(/\s+/).filter(Boolean);
        if (fields.length > 0) {
          if (fields[0].startsWith('-')) {
            const exclude = fields.map(f => f.substring(1));
            attributes = { exclude };
          } else {
            const onlyPlus = fields.every(f => f.startsWith('+'));
            if (!onlyPlus) {
              const include = fields.map(f => f.startsWith('+') ? f.substring(1) : f);
              if (!include.includes('_id')) include.push('_id');
              attributes = include;
            }
          }
        }
      }
      if (attributes) {
        queryOptions.attributes = attributes;
      }
    }

    if (this.sortCall) {
      let order = [];
      if (typeof this.sortCall === 'string') {
        const fields = this.sortCall.split(/\s+/).filter(Boolean);
        for (let f of fields) {
          if (f.startsWith('-')) {
            order.push([f.substring(1), 'DESC']);
          } else {
            order.push([f, 'ASC']);
          }
        }
      } else if (typeof this.sortCall === 'object') {
        for (let [k, v] of Object.entries(this.sortCall)) {
          order.push([k, v === -1 || v === 'desc' || v === 'DESC' ? 'DESC' : 'ASC']);
        }
      }
      if (order.length > 0) {
        queryOptions.order = order;
      }
    }

    if (this.limitCall !== null && this.limitCall !== undefined) {
      queryOptions.limit = this.limitCall;
    }
    if (this.skipCall !== null && this.skipCall !== undefined) {
      queryOptions.offset = this.skipCall;
    }

    if (this.op === 'find') {
      const where = mongoToSequelizeQuery(this.arg);
      queryOptions.where = where;
      const records = await sequelizeModel.findAll(queryOptions);
      result = records.map(r => wrapDocument(r, modelName));
    } else if (this.op === 'findOne') {
      const where = mongoToSequelizeQuery(this.arg);
      queryOptions.where = where;
      const record = await sequelizeModel.findOne(queryOptions);
      result = record ? wrapDocument(record, modelName) : null;
    } else if (this.op === 'findById') {
      if (!this.arg) {
        result = null;
      } else {
        const record = await sequelizeModel.findByPk(this.arg, queryOptions);
        result = record ? wrapDocument(record, modelName) : null;
      }
    } else if (this.op === 'findByIdAndUpdate') {
      const { id, update, options } = this.arg;
      const values = update.$set ? update.$set : update;
      const record = await sequelizeModel.findByPk(id);
      if (record) {
        await record.update(values);
        result = wrapDocument(record, modelName);
      } else {
        result = null;
      }
    } else if (this.op === 'findByIdAndDelete') {
      const record = await sequelizeModel.findByPk(this.arg);
      if (record) {
        await record.destroy();
        result = wrapDocument(record, modelName);
      } else {
        result = null;
      }
    } else if (this.op === 'findOneAndDelete') {
      const where = mongoToSequelizeQuery(this.arg);
      const record = await sequelizeModel.findOne({ where });
      if (record) {
        await record.destroy();
        result = wrapDocument(record, modelName);
      } else {
        result = null;
      }
    } else if (this.op === 'findOneAndUpdate') {
      const { filter, update, options } = this.arg;
      const where = mongoToSequelizeQuery(filter);
      const record = await sequelizeModel.findOne({ where });
      const values = update.$set ? update.$set : update;
      if (record) {
        await record.update(values);
        result = wrapDocument(record, modelName);
      } else {
        result = null;
      }
    }

    // Populate relations if requested
    if (result && this.populateCalls.length > 0) {
      if (Array.isArray(result)) {
        for (let pop of this.populateCalls) {
          await populateHelper(result, pop.path, pop.select);
        }
      } else {
        for (let pop of this.populateCalls) {
          await populateHelper([result], pop.path, pop.select);
        }
      }
    }

    return result;
  }

  then(resolve, reject) {
    this.exec().then(resolve, reject);
  }
}

class SchemaMock {
  constructor(definition, options) {
    this.definition = definition;
    this.options = options;
  }
  pre(hook, fn) {
    // Hooks are handled by Sequelize directly
  }
  index(fields, options) {
    // Indexes are defined in model properties
  }
}

const mongooseMock = {
  Schema: SchemaMock,
  model: (name, schema) => {
    return module.exports[name];
  },
  connect: async (uri, options) => {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log('✅ PostgreSQL Connected via Sequelize and sync completed.');
    return {
      connection: {
        host: sequelize.options.host,
        name: sequelize.config.database
      }
    };
  },
  disconnect: async () => {
    await sequelize.close();
    console.log('🔌 PostgreSQL Connection closed.');
  },
  connection: {
    readyState: 1,
    host: 'localhost',
    name: 'prolink'
  }
};

const UserCompat = createModelWrapper(User, 'User');
const CargoCompat = createModelWrapper(Cargo, 'Cargo');
const FeatureCompat = createModelWrapper(Feature, 'Feature');
const StatisticCompat = createModelWrapper(Statistic, 'Statistic');
const ShipmentCompat = createModelWrapper(Shipment, 'Shipment');
const ConversationCompat = createModelWrapper(Conversation, 'Conversation');
const MessageCompat = createModelWrapper(Message, 'Message');
const PaymentCompat = createModelWrapper(Payment, 'Payment');
const JobPostCompat = createModelWrapper(JobPost, 'JobPost');

module.exports = {
  ...mongooseMock,
  User: UserCompat,
  Cargo: CargoCompat,
  Feature: FeatureCompat,
  Statistic: StatisticCompat,
  Shipment: ShipmentCompat,
  Conversation: ConversationCompat,
  Message: MessageCompat,
  Payment: PaymentCompat,
  JobPost: JobPostCompat,
  sequelize
};
