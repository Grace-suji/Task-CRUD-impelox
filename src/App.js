import { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';

function App() {
  const [search, setSearch] = useState("");
  const [check, setCheck] = useState([]);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [grade, setGrade] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [students, setStudents] = useState([]);
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [editingId, setEditingId] = useState(null);

  const fetchStudents = async () => {
    try {
      const response = await axios.get(`http://localhost:3003/students`);
      const updatedstudents = response.data.map((student) => ({
        ...student,
        status: student.grade.toLowerCase() === "c" ? "fail" : "pass",
      }));
      setStudents(updatedstudents);
    } catch (e) {
      console.log(e);
    }
  };

  const handleAddOrUpdate = async () => {
    if (!name || !age || !grade || !phone || !address) {
      alert("Please fill in all fields before submitting.");
      return;
    }

    const student = { name, age: parseInt(age), grade, phone: parseInt(phone), address };
    if (editingId) {
      await axios.put(`http://localhost:3003/students/${editingId}`, student);
      setEditingId(null);
    } else {
      await axios.post(`http://localhost:3003/students`, student);
    }
    resetForm();
    fetchStudents();
    
  };

  const handleEdit = (student) => {
    setName(student.name);
    setAge(student.age);
    setGrade(student.grade);
    setPhone(student.phone);
    setAddress(student.address);
    setEditingId(student.id);
  };

  const handleDelete = async () => {
    if (check.length > 0) {
      for (const id of check) {
        await axios.delete(`http://localhost:3003/students/${id}`);
      }
      setCheck([]); 
      fetchStudents();
    } else {
      alert("Please select at least one student to delete.");
    }
  };

  const handleCheck = (id) => {
    setCheck((prevCheck) => {
      if (prevCheck.includes(id)) {
        return prevCheck.filter((studentId) => studentId !== id); 
      } else {
        return [...prevCheck, id];
      }
    });
    console.log(check)
  };

  const handleSort = (field) => {
    const order = field === sortField && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortOrder(order);
  };

  const sortedStudents = [...students]
    .filter((student) => {
      return student.name.toLowerCase().includes(search.toLowerCase());
    })
    .sort((a, b) => {
      if (a[sortField] < b[sortField]) return sortOrder === 'asc' ? -1 : 1;
      if (a[sortField] > b[sortField]) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  const resetForm = () => {
    setName('');
    setAge('');
    setGrade('');
    setPhone('');
    setAddress('');
    setEditingId(null);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return (
    <div className="App">
      <h1>Student Management</h1>
      <div className="input-box">
        <input type="search" placeholder="search by name" value={search} onChange={(e) => setSearch(e.target.value)}/>
        <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)}/>
        <input type="number" placeholder="Age" value={age} onChange={(e) => setAge(e.target.value)}/>
        <input type="text" placeholder="Grade" value={grade} onChange={(e) => setGrade(e.target.value)}/>
        <input type="number" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)}/>
        <input type="text" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)}/>
        <button onClick={handleAddOrUpdate}>{editingId ? 'Update' : 'Add'} Student</button>
      </div>

      <table border={1}>
        <thead>
          <tr>
            <th onClick={() => handleSort('s.no')}>S.No {sortField === 's.no' && (sortOrder === 'asc' ? ' ▲' : ' ▼')}</th>
            <th onClick={() => handleSort('name')}> Name {sortField === 'name' && (sortOrder === 'asc' ? '▲' : '▼')}</th>
            <th onClick={() => handleSort('age')}>Age {sortField === 'age' && (sortOrder === 'asc' ? '▲' : '▼')}</th>
            <th onClick={() => handleSort('grade')}>Grade {sortField === 'grade' && (sortOrder === 'asc' ? '▲' : '▼')}</th>
            <th onClick={() => handleSort('status')}>Status {sortField === 'status' && (sortOrder === 'asc' ? '▲' : '▼')}</th>
            <th>Address</th>
            <th>Phone</th>
            <th>Checkbox</th>
            <th colSpan={2} className="action"> Actions </th>
          </tr>
        </thead>
        <tbody>
          {sortedStudents.map((student) => {
            const originalIndex = students.findIndex((s) => s.id === student.id);
            return (
              <tr key={student.id}>
                <td>{originalIndex + 1}</td>
                <td>{student.name}</td>
                <td>{student.age}</td>
                <td>{student.grade}</td>
                <td style={{color: student.status === 'fail' ? '#721c24' : '#155724',}}>{student.status}</td>
                <td>{student.address}</td>
                <td>{student.phone}</td>
                <td>
                  <input type="checkbox"  onChange={() => handleCheck(student.id)}/>
                </td>
                <td>
                  <button className="edit" onClick={() => handleEdit(student)}>
                    Edit
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <button className="delete" onClick={handleDelete}> Delete </button>
    </div>
  );
}

export default App;
