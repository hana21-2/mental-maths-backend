const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

const supabaseUrl = 'https://shxojdaibiwxprejmtns.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoeG9qZGFpYml3eHByZWptdG5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwMjU1ODEsImV4cCI6MjA2NjYwMTU4MX0.be0qd6SH-D1r17xo1Vhu1FDJFcsgLvYRjQ3Q2K3WMV8';
const supabase = createClient(supabaseUrl, supabaseKey);

// Login route
app.post('/api/login', async (req, res) => {
  const { name, email, code } = req.body;
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('code', code)
    .single();

  if (error) return res.status(401).json({ message: 'Invalid code' });

  const createdAt = new Date(data.created_at);
  const now = new Date();
  const diff = (now - createdAt) / (1000 * 60 * 60 * 24);
  if (diff > 30) return res.status(403).json({ message: 'Code expired' });

  res.json({ success: true });
});

// Save score
app.post('/api/save-score', async (req, res) => {
  const { student_code, level, correct, wrong, duration } = req.body;
  const { error } = await supabase.from('scores').insert([{ student_code, level, correct, wrong, duration }]);
  if (error) return res.status(500).json({ message: 'Failed to save score' });
  res.json({ success: true });
});

app.get('/api/scores/:code', async (req, res) => {
  const { code } = req.params;
  const { data, error } = await supabase
    .from('scores')
    .select('*')
    .eq('student_code', code)
    .order('date', { ascending: false });

  if (error) return res.status(500).json({ message: 'Error fetching scores' });
  res.json(data);
});


app.listen(5000, () => console.log('Server running on port 5000'));
