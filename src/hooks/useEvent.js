import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = '/api/event';

export function useEventList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 사용자 페이지에서는 published 상태의 이벤트만 가져옴
    axios.get(`${API_URL}/published`)
      .then(res => {
        const arr = Array.isArray(res.data) ? res.data : [];
        arr.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        setEvents(arr);
      })
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  return { events, loading };
}

export function useEventActions() {
  const createEvent = async (event) => {
    await axios.post(API_URL, event);
  };
  const updateEvent = async (event) => {
    await axios.put(API_URL, event);
  };
  const deleteEvent = async (id) => {
    await axios.delete(`${API_URL}/${id}`);
  };
  return { createEvent, updateEvent, deleteEvent };
} 