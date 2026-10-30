import type { Project, CategoryId } from '../types';

function work(params: { slug: string; category: CategoryId; title: string; subtitle: string; description: string; tags: string[]; live: string; featured?: boolean; problem?: string; solution?: string; outcome?: string; sort?: number }): Project {
  const { slug, category, title, subtitle, description, tags, live, featured = false, problem = '', solution = '', outcome = '', sort = 0 } = params;
  return {
    id: `demo-${slug}`, slug, category, title, subtitle, description, tags, year: 2026,
    cover_url: null, live_url: live, asset_url: null, repo_url: null,
    featured, status: 'published', sort_order: sort, problem, solution, outcome,
    created_at: '2026-10-25T00:00:00Z', updated_at: '2026-10-25T00:00:00Z',
  };
}

// ผลงานจากลิงก์ที่เจ้าของส่งมาโดยตรง ไม่ใช่ผลงานตัวอย่างสมมติ
// สอง TinyURL ไม่สามารถตรวจสอบปลายทางได้ จึงใช้คำบรรยายกลาง ๆ ไว้ก่อน
export const demoProjects: Project[] = [
  work({ slug: 'leuknueng', category: 'web-app', title: 'LEUKNUENG', subtitle: 'Community & Poll Platform', description: 'เว็บแอปสำหรับตั้งคำถาม สร้างโพล และแลกเปลี่ยนความคิดเห็นในชุมชน พร้อมระบบจัดการข้อมูลและหมวดหมู่', tags: ['React', 'Community', 'Polling'], live: 'https://leuknueng.pages.dev/#/', featured: true, sort: 1,
    problem: 'เนื้อหาและความเห็นของผู้ใช้ต้องถูกจัดระเบียบให้ค้นหาและติดตามได้ง่าย', solution: 'ออกแบบพื้นที่สร้างโพล ถามปัญหา และหน้าแสดงเนื้อหาที่จัดตามหมวดหมู่', outcome: 'เว็บไซต์ที่เปิดให้เข้าชมได้ พร้อมแนวทางขยายเป็นแพลตฟอร์มชุมชน' }),
  work({ slug: 'dinproperty', category: 'web-app', title: 'DINproperty', subtitle: 'Private Property Network', description: 'แพลตฟอร์มสำหรับรับความต้องการซื้อและขายอสังหาริมทรัพย์ พร้อมแนวคิดการจับคู่ข้อมูลหลังบ้านโดยไม่แสดงประกาศต่อสาธารณะ', tags: ['Web App', 'Real Estate', 'UX Strategy'], live: 'https://dinproperty.sj4dome.workers.dev/', featured: true, sort: 2,
    problem: 'การประกาศซื้อขายสาธารณะไม่เหมาะกับลูกค้าทุกกลุ่ม', solution: 'สร้างประสบการณ์รับข้อมูลความต้องการแบบส่วนตัว และอธิบายขั้นตอนบริการอย่างชัดเจน', outcome: 'เว็บไซต์บริการแบบส่วนตัวที่เผยแพร่จริง' }),
  work({ slug: 'north-circle', category: 'website', title: 'NORTH CIRCLE', subtitle: 'Northern Thailand Travel Website', description: 'เว็บไซต์นำเสนอการเดินทางแบบกลุ่ม กิจกรรมท้องถิ่น โปรแกรมทัวร์ และช่องทางติดต่อสำหรับผู้สนใจเที่ยวภาคเหนือ', tags: ['Tourism', 'Website', 'Responsive'], live: 'https://northcircle.fivethousandyears.org/', featured: true, sort: 4,
    problem: 'โปรแกรมท่องเที่ยวมีหลายแบบ ต้องช่วยให้ผู้เยี่ยมชมเลือกได้ง่าย', solution: 'แยกประเภทประสบการณ์ ทัวร์ กิจกรรม และข้อมูลการติดต่อให้ชัด', outcome: 'เว็บไซต์ธุรกิจท่องเที่ยวที่เผยแพร่จริง' }),
  work({ slug: 'kh14-community', category: 'web-app', title: 'KH14 Community Intelligence', subtitle: 'Community Data & Smart Survey', description: 'ระบบจัดการทะเบียนครัวเรือน ข้อมูลสมาชิก แดชบอร์ดชุมชน และแบบสำรวจเพื่อสนับสนุนการพัฒนาหมู่บ้าน', tags: ['Community', 'Dashboard', 'Smart Survey'], live: 'https://kh14-community.sj4dome.workers.dev/', featured: true, sort: 3, problem: 'ข้อมูลชุมชนต้องจัดเก็บและค้นหาได้อย่างเป็นระบบ', solution: 'รวมข้อมูลครัวเรือนและเครื่องมือสำรวจไว้ในระบบเดียว', outcome: 'เว็บแอปที่ใช้งานผ่าน Cloudflare Workers' }),
  work({ slug: 'khom-festival', category: 'landing-page', title: 'KHOM Festival', subtitle: 'Chiang Mai Lantern Festival 2026', description: 'Landing Page สำหรับเทศกาลโคมลอยเชียงใหม่ พ.ศ. 2569 พร้อมข้อมูลสถานที่จัดงาน บัตรเข้าร่วม และสลับภาษาไทย–อังกฤษ', tags: ['Landing Page', 'Bilingual', 'Event'], live: 'https://lanternfestival.fivethousandyears.org/', featured: true, sort: 5,
    problem: 'งานมีสองสถานที่และหลายประเภทบัตร จึงต้องสื่อสารให้ผู้ชมเข้าใจตรงกัน', solution: 'จัดข้อมูลตามสถานที่ วันที่ บัตร และคำถามที่พบบ่อย พร้อมสลับภาษา', outcome: 'เว็บประชาสัมพันธ์ที่เปิดให้ใช้งานจริง' }),
  work({ slug: 'doi-suthep-meditation', category: 'website', title: 'Doi Suthep Vipassana', subtitle: 'Meditation Center Website', description: 'เว็บไซต์ภาษาอังกฤษของศูนย์วิปัสสนาวัดพระธาตุดอยสุเทพ แนะนำหลักสูตร ตารางกิจกรรม ข้อปฏิบัติ และข้อมูลสำหรับผู้สนใจ', tags: ['Information Architecture', 'Website', 'Content'], live: 'https://www.fivethousandyears.org/', sort: 6,
    problem: 'ข้อมูลการเตรียมตัวและการปฏิบัติธรรมมีหลายส่วนที่ผู้มาเยือนควรเข้าถึงได้', solution: 'จัดโครงสร้างเนื้อหาเป็นหัวข้อหลักสูตร การเตรียมตัว ตารางประจำวัน และข้อมูลติดต่อ', outcome: 'เว็บไซต์ข้อมูลศูนย์วิปัสสนาที่เปิดใช้งานจริง' }),
  work({ slug: 'shortlink-ttxagi', category: 'other', title: 'ผลงานผ่านลิงก์ 06', subtitle: 'Project link · รอยืนยันชื่อผลงาน', description: 'ลิงก์โปรเจกต์ที่บันทึกไว้ ยังไม่ได้ยืนยันชื่อและรายละเอียดของหน้าปลายทาง', tags: ['External Project', 'To Describe'], live: 'https://tinyurl.com/ttxagi', sort: 7 }),
  work({ slug: 'shortlink-m0014', category: 'other', title: 'ผลงานผ่านลิงก์ 07', subtitle: 'Project link · รอยืนยันชื่อผลงาน', description: 'ลิงก์โปรเจกต์ที่บันทึกไว้ ยังไม่ได้ยืนยันชื่อและรายละเอียดของหน้าปลายทาง', tags: ['External Project', 'To Describe'], live: 'https://tinyurl.com/m0014', sort: 8 }),
];
