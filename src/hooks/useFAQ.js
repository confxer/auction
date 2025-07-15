import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = '/api/faq';

export function useFAQList() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 사용자 페이지에서는 published 상태의 FAQ만 가져옴
    axios.get(`${API_URL}/published`)
      .then(res => setFaqs(Array.isArray(res.data) ? res.data : []))
      .catch(() => setFaqs([]))
      .finally(() => setLoading(false));
  }, []);

  return { faqs, loading };
}

export function useFAQActions() {
  const createFAQ = async (faq) => {
    await axios.post(API_URL, faq);
  };
  const updateFAQ = async (faq) => {
    await axios.put(API_URL, faq);
  };
  const deleteFAQ = async (id) => {
    await axios.delete(`${API_URL}/${id}`);
  };
  return { createFAQ, updateFAQ, deleteFAQ };
} 