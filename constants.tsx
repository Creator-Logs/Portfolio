import { Category, Project } from './types';

export const NAV_LINKS = [
  { label: 'Home', href: '#' },
  { label: 'About', href: '#about' },
  { label: 'Portfolio', href: '#portfolio' },
  { label: 'Contact', href: '#contact' },
];

export const projects: Project[] = [
  {
    id: '1',
    title: 'Autonomous Robotic Arm',
    subtitle: '6-DOF Manipulator with Computer Vision',
    description: 'Designed and engineered a 6-degree-of-freedom robotic arm capable of autonomous object sorting. The project involved end-to-end CAD modeling in SolidWorks, stress analysis using ANSYS, and custom PCB design for the motor controllers.',
    category: [Category.CAD, Category.ELECTRICAL, Category.SOFTWARE],
    thumbnailUrl: 'https://picsum.photos/800/600?random=1',
    galleryUrls: ['https://picsum.photos/1200/800?random=101', 'https://picsum.photos/1200/800?random=102'],
    date: 'Oct 2023',
    tools: ['SolidWorks', 'Python', 'Altium', 'OpenCV'],
    specs: ['Payload: 2.5kg', 'Reach: 850mm', 'Repeatability: +/- 0.5mm', 'Power: 24V DC']
  },
  {
    id: '2',
    title: 'Smart Home Energy Hub',
    subtitle: 'IoT Power Monitoring System',
    description: 'A centralized smart home controller that monitors real-time energy usage. The system features a React Native mobile app for visualization and an ESP32-based backend for sensor data aggregation.',
    category: [Category.ELECTRICAL, Category.SOFTWARE],
    thumbnailUrl: 'https://picsum.photos/800/600?random=2',
    galleryUrls: ['https://picsum.photos/1200/800?random=201', 'https://picsum.photos/1200/800?random=202'],
    date: 'Aug 2023',
    tools: ['React Native', 'ESP32', 'Node.js', 'MQTT'],
    specs: ['Sampling Rate: 1kHz', 'Connectivity: Wi-Fi/BLE', 'Cloud: AWS IoT', 'Battery Life: 6 Months']
  },
  {
    id: '3',
    title: 'V12 Engine Assembly',
    subtitle: 'High-Fidelity CAD Model',
    description: 'A comprehensive educational model of a V12 internal combustion engine. Focused on accurate tolerance stacks and moving part simulations. Rendered in Keyshot for photorealistic visualization.',
    category: [Category.CAD],
    thumbnailUrl: 'https://picsum.photos/800/600?random=3',
    galleryUrls: ['https://picsum.photos/1200/800?random=301'],
    date: 'May 2023',
    tools: ['Fusion 360', 'Keyshot'],
    specs: ['Part Count: 450+', 'Scale: 1:4', 'Material: Aluminum 6061', 'Render Time: 48hrs']
  },
  {
    id: '4',
    title: 'Portfolio Optimizer CLI',
    subtitle: 'Algorithmic Trading Tool',
    description: 'A command-line interface tool written in Rust for optimizing stock portfolios using Mean-Variance Analysis. Fetches real-time market data and outputs efficient frontier visualization.',
    category: [Category.SOFTWARE],
    thumbnailUrl: 'https://picsum.photos/800/600?random=4',
    galleryUrls: ['https://picsum.photos/1200/800?random=401'],
    date: 'Jan 2024',
    tools: ['Rust', 'Python', 'Pandas'],
    specs: ['Latency: <50ms', 'Data Source: AlphaVantage', 'Optimization: Quadratic Prog.', 'LOC: 2500']
  },
   {
    id: '5',
    title: 'Drone Flight Controller',
    subtitle: 'Custom PCB & Firmware',
    description: 'Designed a custom flight controller PCB featuring an STM32 microcontroller and IMU sensor fusion. Wrote custom firmware for PID stabilization and telemetry logging.',
    category: [Category.ELECTRICAL, Category.SOFTWARE],
    thumbnailUrl: 'https://picsum.photos/800/600?random=5',
    galleryUrls: ['https://picsum.photos/1200/800?random=501'],
    date: 'Dec 2023',
    tools: ['KiCad', 'C++', 'STM32'],
    specs: ['PCB Layers: 4', 'MCU: STM32F405', 'IMU: MPU6000', 'OSD: Integrated']
  },
];
