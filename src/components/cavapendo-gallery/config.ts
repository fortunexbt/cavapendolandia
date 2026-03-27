import * as THREE from "three";
import { MEADOW_DEPOSIT_SITES } from "@/lib/meadowWorld";
import {
  type DepositSite,
  type DoorTrigger,
  type Offering,
  type StoryCreatureData,
} from "@/components/cavapendo-gallery/types";

export const ROOM_HALF = 18;
export const ROOM_HEIGHT = 14;
export const WALL_TOP_Y = 4;
export const DOOR_WIDTH = 6;
export const GALLERY_FLOOR_Y = -3;
export const EYE_HEIGHT = -1.8;
export const GALLERY_SPEED = 6;
export const MEADOW_SPEED = 14.5;
export const JUMP_VELOCITY = 6;
export const GRAVITY = -15;
export const MEADOW_GRAVITY = -5.2;
export const MEADOW_JUMP_VELOCITY = 6.8;
export const MAX_PITCH = Math.PI / 2 - 0.14;

export const GALLERY_SPAWN = {
  position: new THREE.Vector3(0, EYE_HEIGHT, 8),
  yaw: 0,
  pitch: 0,
};

export const UP_VECTOR = new THREE.Vector3(0, 1, 0);

export const DOOR_LABELS: Record<DoorTrigger["id"], string> = {
  exit: "USCITA",
  outdoor: "ESTERNO",
  return: "GALLERIA",
};

export const GALLERY_DOORS: DoorTrigger[] = [
  { id: "exit", label: "USCITA", position: [0, EYE_HEIGHT, 16.2], radius: 2.4 },
  {
    id: "outdoor",
    label: "ESTERNO",
    position: [0, EYE_HEIGHT, -16.2],
    radius: 2.6,
  },
];

export const DEPOSIT_SITES: DepositSite[] = MEADOW_DEPOSIT_SITES;

export const CREATURES: StoryCreatureData[] = [
  {
    id: "cavalluccio-marino",
    name: "Cavalluccio Marino",
    story:
      "«Noi cavallucci siamo i primi cavapendoli: oscilliamo nell'acqua come pendoli viventi. Ogni onda ci spinge, ogni corrente ci tira, ma noi non cadiamo mai.»",
    position: [-8, GALLERY_FLOOR_Y + 1.4, -9],
    color: "#7a9b8a",
    kind: "seahorse",
    scale: 1.1,
  },
  {
    id: "gufo-saggio",
    name: "Gufo Saggio",
    story:
      "«Di notte conto i cavapendoli che dondolano tra le stelle. Non finiscono mai. E ogni volta che ne conto uno, ne nascono tre nuovi.»",
    position: [10, GALLERY_FLOOR_Y + 2.1, -7],
    color: "#8b7355",
    kind: "owl",
    scale: 1,
  },
  {
    id: "lucertola-sognatrice",
    name: "Lucertola Sognatrice",
    story:
      "«Mi fermo al sole e sogno cavapendoli fatti di luce, che oscillano senza ombra. Li vedo solo io, perché ho gli occhi fatti di cristallo.»",
    position: [4.5, GALLERY_FLOOR_Y + 0.45, 6.5],
    color: "#6b8b5b",
    kind: "lizard",
    scale: 0.92,
  },
  {
    id: "lumaca-filosofa",
    name: "Lumaca Filosofa",
    story:
      "«Ogni cavapendolo è una spirale, come la mia casa. Il tempo gira, mai dritto. Chi ha fretta non troverà mai un cavapendolo.»",
    position: [-6, GALLERY_FLOOR_Y + 0.35, 7.5],
    color: "#b09878",
    kind: "snail",
    scale: 0.95,
  },
  {
    id: "gatto-lunare",
    name: "Gatto Lunare",
    story:
      "«I cavapendoli migliori appaiono a mezzanotte, quando nessuno guarda. Li catturo con le mie zampe di velluto e li nascondo sotto la luna.»",
    position: [12, GALLERY_FLOOR_Y + 1.25, 2],
    color: "#4a4a5a",
    kind: "cat",
    scale: 1.05,
  },
  {
    id: "rana-cantante",
    name: "Rana Cantante",
    story:
      "«Canto per i cavapendoli: cra-cra-pendolo, cra-cra-pendolo… è la mia ninna nanna. Quando smetto di cantare, il mondo si ferma un istante.»",
    position: [-11, GALLERY_FLOOR_Y + 0.75, 0],
    color: "#5a8b5a",
    kind: "frog",
    scale: 0.92,
  },
];

export const DEMO_OFFERINGS: Offering[] = [
  {
    id: "demo-1",
    title: "Il Primo Cavapendolo",
    note: "Ho immaginato un piccolo essere che oscilla nel vento",
    text_content:
      "I cavapendoli sono creature di luce, sospese tra il cielo e la terra.",
    media_type: "text",
    file_url: null,
    link_url: null,
    author_name: "Maria",
    author_type: "name",
    created_at: "2024-01-15",
  },
  {
    id: "demo-2",
    title: "Spirale d'Argento",
    note: "Un disegno che rappresenta il movimento",
    media_type: "image",
    file_url: "/cavapendoli/models-a.png",
    link_url: null,
    author_name: "Roberto",
    author_type: "name",
    created_at: "2024-01-16",
  },
  {
    id: "demo-3",
    title: "Pensiero Sospeso",
    text_content:
      "Come un pendolo che non trova mai il fondo, così va la vita.",
    media_type: "text",
    file_url: null,
    link_url: null,
    author_type: "anonymous",
    author_name: null,
    created_at: "2024-01-17",
  },
  {
    id: "demo-4",
    title: "Movimento",
    note: "Il cavapendolo che si muove nell'aria",
    media_type: "image",
    file_url: "/cavapendoli/models-b.png",
    link_url: null,
    author_name: "@artista",
    author_type: "instagram",
    created_at: "2024-01-18",
  },
  {
    id: "demo-5",
    title: "Nel Vento",
    text_content: "Sospesi, fluttuando nel tempo che non passa mai.",
    media_type: "text",
    file_url: null,
    link_url: null,
    author_name: "Giulia",
    author_type: "name",
    created_at: "2024-01-19",
  },
  {
    id: "demo-6",
    title: "Colore B",
    media_type: "image",
    file_url: "/cavapendoli/models-bw.png",
    link_url: null,
    author_name: "Luca",
    author_type: "name",
    created_at: "2024-01-20",
  },
];
