import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = '/api/inquiry';

export function useInquiryList() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(API_URL)
      .then(res => {
        const arr = Array.isArray(res.data) ? res.data : [];
        arr.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        setInquiries(arr);
      })
      .catch(() => setInquiries([]))
      .finally(() => setLoading(false));
  }, []);

  return { inquiries, loading };
}

export function useUserInquiryList(userId) {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    axios.get(`${API_URL}/user/${userId}`)
      .then(res => {
        const arr = Array.isArray(res.data) ? res.data : [];
        arr.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        setInquiries(arr);
      })
      .catch(() => setInquiries([]))
      .finally(() => setLoading(false));
  }, [userId]);

  return { inquiries, loading };
}

export function useInquiryActions() {
  const createInquiry = async (inquiry) => {
    await axios.post(API_URL, inquiry);
  };
  const answerInquiry = async (id, { answer, status }) => {
    await axios.put(`${API_URL}/answer/${id}`, { answer, status }, { headers: { 'Content-Type': 'application/json' } });
  };
  const deleteInquiry = async (id) => {
    await axios.delete(`${API_URL}/${id}`);
  };
  return { createInquiry, answerInquiry, deleteInquiry };
} 