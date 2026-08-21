const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const Employee = require("../model/empolyeeModel");

const EMAIL_PATTERN = /\S+@\S+\.\S+/;

const findByIdOrEmployeeId = (id) => {
  const filters = [{ employeeId: id }];
  if (mongoose.isValidObjectId(id)) {
    filters.push({ _id: id });
  }
  return Employee.findOne({ $or: filters });
};

const generateEmployeeId = async () => {
  const employees = await Employee.find({}, "employeeId");
  const maxNumber = employees.reduce((max, employee) => {
    const num = Number(String(employee.employeeId).replace(/\D/g, "")) || 0;
    return num > max ? num : max;
  }, 0);
  return `EMP${String(maxNumber + 1).padStart(3, "0")}`;
};

// Add employee
const addEmployee = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      gender,
      dob,
      department,
      designation,
      salary,
      joiningDate,
      address,
      status,
      role,
    } = req.body;

    if (!name || !email || !phone || !department || !designation || !salary || !joiningDate || !address) {
      return res.status(400).json({ message: "Please fill all required employee fields" });
    }

    if (!EMAIL_PATTERN.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    const salaryValue = Number(salary);
    if (Number.isNaN(salaryValue) || salaryValue <= 0) {
      return res.status(400).json({ message: "Please enter a valid salary amount" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingEmployee = await Employee.findOne({ email: normalizedEmail });
    if (existingEmployee) {
      return res.status(409).json({ message: "An employee already exists with this email" });
    }

    const employeeId = await generateEmployeeId();
    const hashedPassword = await bcrypt.hash(crypto.randomBytes(16).toString("hex"), 10);

    const employee = await Employee.create({
      employeeId,
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: role || "Employee",
      phone,
      gender,
      dob,
      department,
      designation,
      salary: salaryValue,
      joiningDate,
      address,
      status,
    });

    const employeeData = employee.toObject();
    delete employeeData.password;

    res.status(201).json({ message: "Employee added successfully", employee: employeeData });
  } catch (error) {
    res.status(500).json({ message: "Failed to add employee", error: error.message });
  }
};

// Get all employees (supports ?search=&department=&status=&page=&limit=)
const getEmployees = async (req, res) => {
  try {
    const { search, department, status, page = 1, limit = 10 } = req.query;

    const query = {};
    if (department) query.department = department;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { employeeId: { $regex: search, $options: "i" } },
      ];
    }

    const pageNumber = Math.max(1, Number(page) || 1);
    const limitNumber = Math.max(1, Number(limit) || 10);

    const [employees, total] = await Promise.all([
      Employee.find(query)
        .select("-password -resetPasswordToken -resetPasswordExpires")
        .sort({ createdAt: -1 })
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber),
      Employee.countDocuments(query),
    ]);

    res.status(200).json({
      employees,
      total,
      page: pageNumber,
      totalPages: Math.ceil(total / limitNumber) || 1,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch employees", error: error.message });
  }
};

// Get employee stats for dashboard cards
const getEmployeeStats = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [total, active, inactive, newEmployees] = await Promise.all([
      Employee.countDocuments(),
      Employee.countDocuments({ status: "Active" }),
      Employee.countDocuments({ status: "Inactive" }),
      Employee.countDocuments({ joiningDate: { $gte: sevenDaysAgo } }),
    ]);

    res.status(200).json({ total, active, inactive, newEmployees });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch employee stats", error: error.message });
  }
};

// Get a single employee by employeeId (e.g. EMP001) or Mongo _id
const getEmployeeById = async (req, res) => {
  try {
    const employee = await findByIdOrEmployeeId(req.params.id).select(
      "-password -resetPasswordToken -resetPasswordExpires"
    );

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.status(200).json({ employee });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch employee", error: error.message });
  }
};

// Update an employee
const updateEmployee = async (req, res) => {
  try {
    const employee = await findByIdOrEmployeeId(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const {
      name,
      email,
      password,
      phone,
      gender,
      dob,
      department,
      designation,
      salary,
      joiningDate,
      address,
      status,
      role,
    } = req.body;

    if (email) {
      if (!EMAIL_PATTERN.test(email)) {
        return res.status(400).json({ message: "Please enter a valid email address" });
      }
      const normalizedEmail = email.trim().toLowerCase();
      const existingEmployee = await Employee.findOne({
        email: normalizedEmail,
        _id: { $ne: employee._id },
      });
      if (existingEmployee) {
        return res.status(409).json({ message: "An employee already exists with this email" });
      }
      employee.email = normalizedEmail;
    }

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
      }
      employee.password = await bcrypt.hash(password, 10);
    }

    if (salary !== undefined) {
      const salaryValue = Number(salary);
      if (Number.isNaN(salaryValue) || salaryValue <= 0) {
        return res.status(400).json({ message: "Please enter a valid salary amount" });
      }
      employee.salary = salaryValue;
    }

    if (name) employee.name = name.trim();
    if (phone) employee.phone = phone;
    if (gender) employee.gender = gender;
    if (dob) employee.dob = dob;
    if (department) employee.department = department;
    if (designation) employee.designation = designation;
    if (joiningDate) employee.joiningDate = joiningDate;
    if (address) employee.address = address;
    if (status) employee.status = status;
    if (role) employee.role = role;

    await employee.save();

    const employeeData = employee.toObject();
    delete employeeData.password;
    delete employeeData.resetPasswordToken;
    delete employeeData.resetPasswordExpires;

    res.status(200).json({ message: "Employee updated successfully", employee: employeeData });
  } catch (error) {
    res.status(500).json({ message: "Failed to update employee", error: error.message });
  }
};

// Delete an employee
const deleteEmployee = async (req, res) => {
  try {
    const filters = [{ employeeId: req.params.id }];
    if (mongoose.isValidObjectId(req.params.id)) {
      filters.push({ _id: req.params.id });
    }

    const employee = await Employee.findOneAndDelete({ $or: filters });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.status(200).json({ message: "Employee deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete employee", error: error.message });
  }
};

module.exports = {
  addEmployee,
  getEmployees,
  getEmployeeStats,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
};
