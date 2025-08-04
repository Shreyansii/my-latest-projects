import api  from './axios'

export async function getUser() {
  const res = await api.get('/user/')
  return res.data  // { username, email, role }
}
