import { createContext, useContext, useEffect, useRef, useState } from "react";

import { login as loginRequest, register as registerRequest } from '../services/authService';

import { getCurrentUser } from '../services/userService';

const AuthContext = createContext(null);

