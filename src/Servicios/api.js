// Configuración base de la API
const API_BASE_URL = 'http://localhost:3001/api';

// Función helper para hacer peticiones
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('token');
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
}

// Servicios de autenticación
export const authService = {
  async login(usuario, password) {
    return apiRequest('/usuarios/login', {
      method: 'POST',
      body: JSON.stringify({ usuario, password }),
    });
  },

  async register(userData) {
    return apiRequest('/usuarios/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
};

// Servicios de inventario
export const inventarioService = {
  async getAll() {
    return apiRequest('/inventario');
  },

  async create(repuesto) {
    return apiRequest('/inventario', {
      method: 'POST',
      body: JSON.stringify(repuesto),
    });
  },

  async update(id, repuesto) {
    return apiRequest(`/inventario/${id}`, {
      method: 'PUT',
      body: JSON.stringify(repuesto),
    });
  },

  async delete(id) {
    return apiRequest(`/inventario/${id}`, {
      method: 'DELETE',
    });
  },
};

// Servicios de clientes
export const clientesService = {
  async getAll() {
    return apiRequest('/clientes');
  },

  async getById(id) {
    return apiRequest(`/clientes/${id}`);
  },

  async create(cliente) {
    return apiRequest('/clientes', {
      method: 'POST',
      body: JSON.stringify(cliente),
    });
  },

  async update(id, cliente) {
    return apiRequest(`/clientes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(cliente),
    });
  },

  async delete(id) {
    return apiRequest(`/clientes/${id}`, {
      method: 'DELETE',
    });
  },

  async getVehiculos(clienteId) {
    return apiRequest(`/clientes/${clienteId}/vehiculos`);
  },

  async getCitas(clienteId) {
    return apiRequest(`/clientes/${clienteId}/citas`);
  },

  async search(termino) {
    return apiRequest(`/clientes/buscar/${termino}`);
  },
};

// Servicios de vehículos
export const vehiculosService = {
  async getAll() {
    return apiRequest('/vehiculos');
  },

  async getById(id) {
    return apiRequest(`/vehiculos/${id}`);
  },

  async create(vehiculo) {
    return apiRequest('/vehiculos', {
      method: 'POST',
      body: JSON.stringify(vehiculo),
    });
  },

  async update(id, vehiculo) {
    return apiRequest(`/vehiculos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(vehiculo),
    });
  },

  async delete(id) {
    return apiRequest(`/vehiculos/${id}`, {
      method: 'DELETE',
    });
  },

  async getByCliente(clienteId) {
    return apiRequest(`/vehiculos/cliente/${clienteId}`);
  },

  async getHistorial(id) {
    return apiRequest(`/vehiculos/${id}/historial`);
  },

  async getHistorialMantenimiento(id) {
    return apiRequest(`/vehiculos/${id}/historial-mantenimiento`);
  },
};

// Servicios de servicios
export const serviciosService = {
  async getAll() {
    return apiRequest('/servicios');
  },

  async getById(id) {
    return apiRequest(`/servicios/${id}`);
  },

  async create(servicio) {
    return apiRequest('/servicios', {
      method: 'POST',
      body: JSON.stringify(servicio),
    });
  },

  async update(id, servicio) {
    return apiRequest(`/servicios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(servicio),
    });
  },

  async delete(id) {
    return apiRequest(`/servicios/${id}`, {
      method: 'DELETE',
    });
  },

  async getByCategoria(categoria) {
    return apiRequest(`/servicios/categoria/${categoria}`);
  },

  async getCategorias() {
    return apiRequest('/servicios/categorias/list');
  },
};

// Servicios de citas
export const citasService = {
  async getAll() {
    return apiRequest('/citas');
  },

  async getById(id) {
    return apiRequest(`/citas/${id}`);
  },

  async create(cita) {
    return apiRequest('/citas', {
      method: 'POST',
      body: JSON.stringify(cita),
    });
  },

  async update(id, cita) {
    return apiRequest(`/citas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(cita),
    });
  },

  async delete(id) {
    return apiRequest(`/citas/${id}`, {
      method: 'DELETE',
    });
  },

  async getByFecha(fecha) {
    return apiRequest(`/citas/fecha/${fecha}`);
  },

  async getByDate(fecha) {
    return apiRequest(`/citas/fecha/${fecha}`);
  },

  async getByDateRange(fechaInicio, fechaFin) {
    return apiRequest(`/citas/rango?inicio=${fechaInicio}&fin=${fechaFin}`);
  },

  async getByMecanico(mecanicoId) {
    return apiRequest(`/citas/mecanico/${mecanicoId}`);
  },

  async updateEstado(id, estado, diagnostico) {
    return apiRequest(`/citas/${id}/estado`, {
      method: 'PATCH',
      body: JSON.stringify({ estado, diagnostico }),
    });
  },

  async getEstadisticas() {
    return apiRequest('/citas/estadisticas/resumen');
  },
};

// Función para verificar si el token es válido
export const verifyToken = async () => {
  const token = localStorage.getItem('token');
  return Boolean(token);
};

// Función para limpiar datos de autenticación
export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};
