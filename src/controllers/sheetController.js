const { Op } = require("sequelize");
const {
  sequelize,
  Sheet,
  SheetColumn,
  SheetRow,
  SheetCell,
} = require("../models");

// helper: parse number safe
function toNumberOrNull(v) {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

// helper: build excel-like response
function buildGridResponse(sheet) {
  const columns = (sheet.columns || [])
    .slice()
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));

  const rows = (sheet.rows || [])
    .slice()
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
    .map((r) => {
      const data = {};
      for (const c of columns) data[c.id] = null;

      for (const cell of r.cells || []) {
        const colId = cell.sheet_column_id;
        data[colId] = cell.numeric_value ?? cell.value ?? null;
      }

      return {
        id: r.id,
        note: r.note,
        order_index: r.order_index,
        created_at: r.created_at,
        updated_at: r.updated_at,
        data, // { [columnId]: value }
      };
    });

  return {
    id: sheet.id,
    name: sheet.name,
    description: sheet.description,
    created_at: sheet.created_at,
    updated_at: sheet.updated_at,
    columns: columns.map((c) => ({
      id: c.id,
      title: c.title,
      key: c.key,
      data_type: c.data_type,
      order_index: c.order_index,
      required: c.required,
    })),
    rows,
  };
}

/**
 * ======================
 * SHEET CRUD
 * ======================
 */

exports.getAllSheets = async (req, res) => {
  try {
    const { q } = req.query;
    const where = {};
    if (q) where.name = { [Op.like]: `%${q}%` };

    const sheets = await Sheet.findAll({
      where,
      order: [["created_at", "DESC"]],
    });

    res.json({ data: sheets });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getSheetById = async (req, res) => {
  try {
    const sheetId = Number(req.params.id);
    if (!sheetId) return res.status(400).json({ message: "Invalid sheet id" });

    const sheet = await Sheet.findByPk(sheetId, {
      include: [
        { model: SheetColumn, as: "columns" },
        {
          model: SheetRow,
          as: "rows",
          include: [{ model: SheetCell, as: "cells" }],
        },
      ],
    });

    if (!sheet) return res.status(404).json({ message: "Sheet not found" });

    return res.json({ data: buildGridResponse(sheet) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.createSheet = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const userId = req.user?.id; // tùy middleware bạn set
    const { name, description, columns } = req.body;

    if (!name) return res.status(400).json({ message: "name is required" });
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const sheet = await Sheet.create(
      {
        name,
        description: description || null,
        created_by: userId,
        updated_by: userId,
      },
      { transaction: t }
    );

    // tạo kèm columns (optional)
    if (Array.isArray(columns) && columns.length > 0) {
      const rowsToCreate = columns.map((c, idx) => ({
        sheet_id: sheet.id,
        title: String(c.title || "").trim(),
        key: c.key ? String(c.key).trim() : null,
        data_type: c.data_type || "text",
        order_index: Number.isFinite(Number(c.order_index)) ? Number(c.order_index) : idx,
        required: !!c.required,
        created_by: userId,
        updated_by: userId,
      }));

      // validate title
      if (rowsToCreate.some((x) => !x.title)) {
        await t.rollback();
        return res.status(400).json({ message: "Column title is required" });
      }

      await SheetColumn.bulkCreate(rowsToCreate, { transaction: t });
    }

    await t.commit();
    res.status(201).json({ message: "Created", data: sheet });
  } catch (err) {
    await t.rollback();
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateSheet = async (req, res) => {
  try {
    const userId = req.user?.id;
    const sheetId = Number(req.params.id);
    const { name, description } = req.body;

    if (!sheetId) return res.status(400).json({ message: "Invalid sheet id" });

    const sheet = await Sheet.findByPk(sheetId);
    if (!sheet) return res.status(404).json({ message: "Sheet not found" });

    await sheet.update({
      name: name ?? sheet.name,
      description: description ?? sheet.description,
      updated_by: userId || sheet.updated_by,
    });

    res.json({ message: "Updated", data: sheet });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteSheet = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const sheetId = Number(req.params.id);
    if (!sheetId) return res.status(400).json({ message: "Invalid sheet id" });

    const sheet = await Sheet.findByPk(sheetId, { transaction: t });
    if (!sheet) return res.status(404).json({ message: "Sheet not found" });

    // xóa thủ công để chắc chắn (nếu bạn chưa bật cascade trong DB)
    const rows = await SheetRow.findAll({ where: { sheet_id: sheetId }, transaction: t });
    const rowIds = rows.map((r) => r.id);

    if (rowIds.length) {
      await SheetCell.destroy({ where: { sheet_row_id: { [Op.in]: rowIds } }, transaction: t });
    }
    await SheetRow.destroy({ where: { sheet_id: sheetId }, transaction: t });
    await SheetColumn.destroy({ where: { sheet_id: sheetId }, transaction: t });
    await sheet.destroy({ transaction: t });

    await t.commit();
    res.json({ message: "Deleted" });
  } catch (err) {
    await t.rollback();
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ======================
 * COLUMN CRUD
 * ======================
 */
exports.getColumns = async (req, res) => {
  try {
    const sheetId = Number(req.params.sheetId);
    const cols = await SheetColumn.findAll({
      where: { sheet_id: sheetId },
      order: [["order_index", "ASC"]],
    });
    res.json({ data: cols });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.createColumn = async (req, res) => {
  try {
    const userId = req.user?.id;
    const sheetId = Number(req.params.sheetId);
    const { title, key, data_type, order_index, required } = req.body;

    if (!title) return res.status(400).json({ message: "title is required" });

    const sheet = await Sheet.findByPk(sheetId);
    if (!sheet) return res.status(404).json({ message: "Sheet not found" });

    const col = await SheetColumn.create({
      sheet_id: sheetId,
      title: String(title).trim(),
      key: key ? String(key).trim() : null,
      data_type: data_type || "text",
      order_index: Number.isFinite(Number(order_index)) ? Number(order_index) : 0,
      required: !!required,
      created_by: userId,
      updated_by: userId,
    });

    res.status(201).json({ message: "Created", data: col });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateColumn = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const userId = req.user?.id;
    const sheetId = Number(req.params.sheetId);
    const columnId = Number(req.params.columnId);

    const { title, key, data_type, order_index, required } = req.body;

    const col = await SheetColumn.findOne({
      where: { id: columnId, sheet_id: sheetId },
      transaction: t,
    });
    if (!col) return res.status(404).json({ message: "Column not found" });

    await col.update(
      {
        title: title !== undefined ? String(title).trim() : col.title,
        key: key !== undefined ? (key ? String(key).trim() : null) : col.key,
        data_type: data_type ?? col.data_type,
        order_index: order_index !== undefined ? Number(order_index) : col.order_index,
        required: required !== undefined ? !!required : col.required,
        updated_by: userId || col.updated_by,
      },
      { transaction: t }
    );

    await t.commit();
    res.json({ message: "Updated", data: col });
  } catch (err) {
    await t.rollback();
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteColumn = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const sheetId = Number(req.params.sheetId);
    const columnId = Number(req.params.columnId);

    const col = await SheetColumn.findOne({
      where: { id: columnId, sheet_id: sheetId },
      transaction: t,
    });
    if (!col) return res.status(404).json({ message: "Column not found" });

    // xóa toàn bộ cells thuộc column này
    await SheetCell.destroy({ where: { sheet_column_id: columnId }, transaction: t });
    await col.destroy({ transaction: t });

    await t.commit();
    res.json({ message: "Deleted" });
  } catch (err) {
    await t.rollback();
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ======================
 * ROW CRUD
 * ======================
 */
exports.getRows = async (req, res) => {
  try {
    const sheetId = Number(req.params.sheetId);
    const rows = await SheetRow.findAll({
      where: { sheet_id: sheetId },
      order: [["order_index", "ASC"]],
      include: [{ model: SheetCell, as: "cells" }],
    });
    res.json({ data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.createRow = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const userId = req.user?.id;
    const sheetId = Number(req.params.sheetId);
    const { note, order_index, cells } = req.body;

    const sheet = await Sheet.findByPk(sheetId, { transaction: t });
    if (!sheet) return res.status(404).json({ message: "Sheet not found" });

    const row = await SheetRow.create(
      {
        sheet_id: sheetId,
        note: note || null,
        order_index: Number.isFinite(Number(order_index)) ? Number(order_index) : 0,
        created_by: userId,
        updated_by: userId,
      },
      { transaction: t }
    );

    // tạo cells kèm theo (optional)
    if (Array.isArray(cells) && cells.length > 0) {
      // validate columns belong to sheet
      const colIds = [...new Set(cells.map((c) => Number(c.sheet_column_id)).filter(Boolean))];
      const existingCols = await SheetColumn.findAll({
        where: { id: { [Op.in]: colIds }, sheet_id: sheetId },
        transaction: t,
      });
      if (existingCols.length !== colIds.length) {
        await t.rollback();
        return res.status(400).json({ message: "Some columns are invalid for this sheet" });
      }

      const toCreate = cells.map((c) => ({
        sheet_row_id: row.id,
        sheet_column_id: Number(c.sheet_column_id),
        value: c.value !== undefined && c.value !== null ? String(c.value) : null,
        numeric_value: c.numeric_value !== undefined ? toNumberOrNull(c.numeric_value) : toNumberOrNull(c.value),
        meta: c.meta ?? null,
      }));

      await SheetCell.bulkCreate(toCreate, { transaction: t });
    }

    await t.commit();
    res.status(201).json({ message: "Created", data: row });
  } catch (err) {
    await t.rollback();
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateRow = async (req, res) => {
  try {
    const userId = req.user?.id;
    const sheetId = Number(req.params.sheetId);
    const rowId = Number(req.params.rowId);
    const { note, order_index } = req.body;

    const row = await SheetRow.findOne({ where: { id: rowId, sheet_id: sheetId } });
    if (!row) return res.status(404).json({ message: "Row not found" });

    await row.update({
      note: note !== undefined ? (note ? String(note) : null) : row.note,
      order_index: order_index !== undefined ? Number(order_index) : row.order_index,
      updated_by: userId || row.updated_by,
    });

    res.json({ message: "Updated", data: row });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteRow = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const sheetId = Number(req.params.sheetId);
    const rowId = Number(req.params.rowId);

    const row = await SheetRow.findOne({ where: { id: rowId, sheet_id: sheetId }, transaction: t });
    if (!row) return res.status(404).json({ message: "Row not found" });

    await SheetCell.destroy({ where: { sheet_row_id: rowId }, transaction: t });
    await row.destroy({ transaction: t });

    await t.commit();
    res.json({ message: "Deleted" });
  } catch (err) {
    await t.rollback();
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ======================
 * CELLS BULK UPSERT (Excel style)
 * ======================
 * body: { cells: [{ rowId, columnId, value, numeric_value, meta }] }
 */
exports.bulkUpsertCells = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const sheetId = Number(req.params.sheetId);
    const { cells } = req.body;

    if (!Array.isArray(cells) || cells.length === 0) {
      return res.status(400).json({ message: "cells is required (array)" });
    }

    // validate sheet exists
    const sheet = await Sheet.findByPk(sheetId, { transaction: t });
    if (!sheet) return res.status(404).json({ message: "Sheet not found" });

    const rowIds = [...new Set(cells.map((x) => Number(x.rowId)).filter(Boolean))];
    const colIds = [...new Set(cells.map((x) => Number(x.columnId)).filter(Boolean))];

    // validate rows belong to sheet
    const rows = await SheetRow.findAll({
      where: { id: { [Op.in]: rowIds }, sheet_id: sheetId },
      transaction: t,
    });
    if (rows.length !== rowIds.length) {
      await t.rollback();
      return res.status(400).json({ message: "Some rows are invalid for this sheet" });
    }

    // validate columns belong to sheet
    const cols = await SheetColumn.findAll({
      where: { id: { [Op.in]: colIds }, sheet_id: sheetId },
      transaction: t,
    });
    if (cols.length !== colIds.length) {
      await t.rollback();
      return res.status(400).json({ message: "Some columns are invalid for this sheet" });
    }

    // upsert per cell
    // NOTE: Sequelize upsert with composite unique index works well in MySQL/Postgres.
    // If lỗi, mình đổi sang findOne+update/create theo từng cell.
    const payload = cells.map((c) => ({
      sheet_row_id: Number(c.rowId),
      sheet_column_id: Number(c.columnId),
      value: c.value !== undefined && c.value !== null ? String(c.value) : null,
      numeric_value: c.numeric_value !== undefined ? toNumberOrNull(c.numeric_value) : toNumberOrNull(c.value),
      meta: c.meta ?? null,
    }));

    // bulkCreate with updateOnDuplicate (MySQL) / upsert style
    await SheetCell.bulkCreate(payload, {
      transaction: t,
      updateOnDuplicate: ["value", "numeric_value", "meta", "updated_at"],
    });

    await t.commit();
    res.json({ message: "Updated", count: payload.length });
  } catch (err) {
    await t.rollback();
    console.error(err);
    res.status(500).json({ message: "Server error", error: String(err?.message || err) });
  }
};


exports.listRows = async (req, res) => {
  try {
    const sheetId = Number(req.params.sheetId);
    if (!sheetId) return res.status(400).json({ message: "Invalid sheetId" });

    // query params
    const q = (req.query.q || "").trim();
    const sortBy = (req.query.sortBy || "updated_at").trim();
    const sortDir = (req.query.sortDir || "desc").toLowerCase() === "asc" ? "asc" : "desc";
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(100, Math.max(5, Number(req.query.limit || 10)));
    const offset = (page - 1) * limit;

    // load columns
    const columns = await SheetColumn.findAll({
      where: { sheet_id: sheetId },
      order: [["order_index", "ASC"]],
    });

    // base where row
    const whereRow = { sheet_id: sheetId };

    // include cells
    const includeCells = {
      model: SheetCell,
      as: "cells",
      required: false,
      ...(q
        ? {
            where: {
              value: { [Op.like]: `%${q}%` },
            },
          }
        : {}),
    };

    // search note
    if (q) {
      whereRow[Op.or] = [
        { note: { [Op.like]: `%${q}%` } },
      ];
    }

    // helper map row
    const mapRow = (r) => {
      const values = {};
      for (const c of columns) values[c.id] = null;
      for (const cell of r.cells || []) {
        values[cell.sheet_column_id] = cell.numeric_value ?? cell.value ?? null;
      }
      return {
        id: r.id,
        note: r.note,
        order_index: r.order_index,
        created_at: r.created_at,
        updated_at: r.updated_at,
        values,
      };
    };

    // sort theo column cell: col:<id>
    const colSortMatch = sortBy.match(/^col:(\d+)$/);
    const sortColumnId = colSortMatch ? Number(colSortMatch[1]) : null;

    let mappedRows;
    let total;

    if (sortColumnId) {
      // Lấy TẤT CẢ rows, sort thủ công, rồi mới phân trang
      const allRows = await SheetRow.findAll({
        where: whereRow,
        include: [includeCells],
        distinct: true,
      });

      const allMapped = allRows.map(mapRow);

      // Sort toàn bộ theo giá trị cell của column đó
      allMapped.sort((a, b) => {
        const av = a.values?.[sortColumnId];
        const bv = b.values?.[sortColumnId];

        const aNum = av !== null && av !== undefined && Number.isFinite(Number(av)) ? Number(av) : null;
        const bNum = bv !== null && bv !== undefined && Number.isFinite(Number(bv)) ? Number(bv) : null;

        let cmp = 0;
        if (aNum !== null && bNum !== null) {
          cmp = aNum - bNum;
        } else if (aNum !== null && bNum === null) {
          cmp = -1; // có số < null (null xuống cuối)
        } else if (aNum === null && bNum !== null) {
          cmp = 1;
        } else {
          // cả 2 đều là string hoặc null
          const as = av ?? "";
          const bs = bv ?? "";
          cmp = String(as).localeCompare(String(bs), "vi");
        }

        return sortDir === "asc" ? cmp : -cmp;
      });

      total = allMapped.length;
      mappedRows = allMapped.slice(offset, offset + limit);

    } else {
      // Sort bằng SQL (các cột mặc định: id, created_at, updated_at, note, order_index)
      const validSqlSorts = ["id", "created_at", "updated_at", "note", "order_index"];
      const sqlSortBy = validSqlSorts.includes(sortBy) ? sortBy : "updated_at";
      const order = [[sqlSortBy, sortDir]];

      const { rows, count } = await SheetRow.findAndCountAll({
        where: whereRow,
        include: [includeCells],
        order,
        limit,
        offset,
        distinct: true,
      });

      total = count;
      mappedRows = rows.map(mapRow);
    }

    return res.json({
      data: {
        sheetId,
        columns: columns.map((c) => ({
          id: c.id,
          title: c.title,
          data_type: c.data_type,
          order_index: c.order_index,
        })),
        rows: mappedRows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};