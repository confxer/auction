import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = '/api/notice';

export function useNoticeList() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 사용자 페이지에서는 published 상태의 공지사항만 가져옴
    axios.get(`${API_URL}/published`)
      .then(res => {
        const arr = Array.isArray(res.data) ? res.data : [];
        arr.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        setNotices(arr);
      })
      .catch(() => setNotices([]))
      .finally(() => setLoading(false));
  }, []);

  return { notices, loading };
}

export function useNoticeActions() {
  const createNotice = async (notice) => {
    await axios.post(API_URL, notice);
  };
  const updateNotice = async (notice) => {
    await axios.put(API_URL, notice);
  };
  const deleteNotice = async (id) => {
    await axios.delete(`${API_URL}/${id}`);
  };
  return { createNotice, updateNotice, deleteNotice };
} 