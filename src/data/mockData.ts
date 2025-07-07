import { Post, User, Comment } from "../types";

const mockUsers: User[] = [
  {
    id: "1",
    username: "codemaster",
    full_name: "Alejandro Rodriguez",
    email: "alex.rodriguez@gmail.com",
    avatar_url:
      "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100",
    provider: "google",
  },
  {
    id: "2",
    username: "reactguru",
    full_name: "Emma Chen",
    email: "emma.chen@users.noreply.github.com",
    avatar_url:
      "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100",
    provider: "github",
  },
  {
    id: "3",
    username: "pythonista",
    full_name: "Miguel Torres",
    email: "michael.thompson@gmail.com",
    avatar_url:
      "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100",
    provider: "google",
  },
];

export const mockPosts: Post[] = [
  {
    id: "1",
    content:
      "Acabo de descubrir esta increíble característica de TypeScript que infiere automáticamente tipos de unión complejos. ¡Alucinante! 🤯",
    topics: ["typescript", "tutorial"],
    author: mockUsers[0],
    createdAt: new Date("2024-12-15T10:30:00"),
    reactions: {
      happy: ["2", "3"],
      sad: [],
    },
    commentsCount: 5,
  },
  {
    id: "2",
    content:
      "Odio PHP. Ya lo he dicho. La nomenclatura inconsistente de las funciones me vuelve loco cada día.",
    topics: ["php", "discusion"],
    image:
      "https://images.pexels.com/photos/177598/pexels-photo-177598.jpeg?auto=compress&cs=tinysrgb&w=800",
    author: mockUsers[1],
    createdAt: new Date("2024-12-15T09:15:00"),
    reactions: {
      happy: ["1"],
      sad: ["3"],
    },
    commentsCount: 10,
  },
  {
    id: "3",
    content:
      "Opinión impopular: CSS Grid es mejor que Flexbox para el 90% de los diseños. ¡Pelea conmigo! 😤",
    topics: ["css", "discusion"],
    author: mockUsers[2],
    createdAt: new Date("2024-12-15T08:45:00"),
    reactions: {
      happy: ["1", "2"],
      sad: [],
    },
    commentsCount: 12,
  },
  {
    id: "4",
    content:
      "Finalmente entendí los closures en JavaScript después de 2 años de desarrollo web. ¡Más vale tarde que nunca! 📚",
    topics: ["javascript", "carrera", "tutorial"],
    image:
      "https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=800",
    author: mockUsers[0],
    createdAt: new Date("2024-12-14T16:20:00"),
    reactions: {
      happy: ["2", "3"],
      sad: [],
    },
    commentsCount: 7,
  },
];

export const mockComments: Comment[] = [
  {
    id: "1",
    content: "¡Lo mismo digo! TypeScript no deja de sorprenderme con su poder.",
    author: mockUsers[1],
    postId: "1",
    createdAt: new Date("2024-12-15T10:45:00"),
  },
  {
    id: "2",
    content:
      "¿Qué característica específicamente? Siempre estoy buscando aprender más trucos de TS.",
    author: mockUsers[2],
    postId: "1",
    createdAt: new Date("2024-12-15T11:00:00"),
  },
  {
    id: "3",
    content: "¡Los tipos condicionales y los tipos mapeados son un cambio de juego!",
    author: mockUsers[0],
    postId: "1",
    parentId: "2",
    createdAt: new Date("2024-12-15T11:15:00"),
  },
  {
    id: "4",
    content: "¡Gracias! Los investigaré.",
    author: mockUsers[2],
    postId: "1",
    parentId: "3",
    createdAt: new Date("2024-12-15T11:30:00"),
  },
  {
    id: "5",
    content:
      "PHP tiene sus problemas, pero el ecosistema es sólido. Laravel lo hace soportable.",
    author: mockUsers[0],
    postId: "2",
    createdAt: new Date("2024-12-15T09:30:00"),
  },
  {
    id: "6",
    content:
      "Laravel es genial, pero el lenguaje en sí todavía tiene inconsistencias.",
    author: mockUsers[1],
    postId: "2",
    parentId: "5",
    createdAt: new Date("2024-12-15T09:45:00"),
  },
  {
    id: "7",
    content: "Cierto, pero cada lenguaje tiene sus peculiaridades. PHP 8+ es mucho mejor.",
    author: mockUsers[2],
    postId: "2",
    parentId: "6",
    createdAt: new Date("2024-12-15T10:00:00"),
  },
];
