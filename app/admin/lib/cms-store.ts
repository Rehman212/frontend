export interface MenuItem {
  id: string;
  label: string;
  url: string;
  order: number;
  visible: boolean;
  pageId?: string;
}

export interface CmsPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: 'published' | 'draft';
  visibility: 'public' | 'private';
  parentId: string | null;
  template: string;
  order: number;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: 'published' | 'draft';
  author: string;
  createdAt: string;
  updatedAt: string;
}

const KEYS = {
  menu: 'cms_menu_items',
  menuSettings: 'cms_menu_settings',
  pages: 'cms_pages',
  pageSlugs: 'cms_page_slugs',
  blog: 'cms_blog_posts',
} as const;

export interface MenuSettings {
  primaryMenuId: string | null;
}

function notifyMenuUpdated() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event('cms-menu-updated'));
}

function read<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify(data));
}

const DEFAULT_MENU: MenuItem[] = [
  { id: '1', label: 'Home', url: '/', order: 1, visible: true },
  { id: '2', label: 'Tools', url: '/#tools', order: 2, visible: true },
  { id: '3', label: 'Blog', url: '/blog', order: 3, visible: true },
];

const DEFAULT_PAGES: CmsPage[] = [
  { id: '1', title: 'About Us', slug: 'about', content: '', status: 'published', visibility: 'public', parentId: null, template: 'default', order: 0, seoTitle: '', seoDescription: '', seoKeywords: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '2', title: 'Privacy Policy', slug: 'privacy', content: '', status: 'published', visibility: 'public', parentId: null, template: 'default', order: 0, seoTitle: '', seoDescription: '', seoKeywords: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '3', title: 'Terms of Service', slug: 'terms', content: '', status: 'draft', visibility: 'public', parentId: null, template: 'default', order: 0, seoTitle: '', seoDescription: '', seoKeywords: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

/** Routes that must NOT be handled as CMS pages */
export const CMS_RESERVED_SLUGS = new Set([
  'admin', 'login', 'signup', 'dashboard', 'auth', 'tool', 'p', 'api', 'blog',
  'favicon.ico', 'icon.png', 'logo.webp', 'robots.txt', 'sitemap.xml',
]);

export function getDefaultPageSlugs(): string[] {
  return DEFAULT_PAGES.map((p) => p.slug);
}

/** All slugs saved in browser (for static export pre-render) */
export function getAllKnownPageSlugs(): string[] {
  const stored = read<Partial<CmsPage>[]>(KEYS.pages, DEFAULT_PAGES);
  const slugs = new Set<string>([...getDefaultPageSlugs(), ...stored.map((p) => p.slug).filter(Boolean) as string[]]);
  return [...slugs].filter((s) => !CMS_RESERVED_SLUGS.has(s));
}

export const cmsStore = {
  getMenu(): MenuItem[] {
    return read(KEYS.menu, DEFAULT_MENU);
  },
  saveMenu(items: MenuItem[]) {
    write(KEYS.menu, items);
    notifyMenuUpdated();
  },
  getMenuSettings(): MenuSettings {
    return read(KEYS.menuSettings, { primaryMenuId: null });
  },
  saveMenuSettings(settings: MenuSettings) {
    write(KEYS.menuSettings, settings);
    notifyMenuUpdated();
  },

  getPages(): CmsPage[] {
    const pages = read<Partial<CmsPage>[]>(KEYS.pages, DEFAULT_PAGES);
    return pages.map((p) => ({
      ...p,
      content: p.content ?? '',
      visibility: p.visibility ?? 'public',
      parentId: p.parentId ?? null,
      template: p.template ?? 'default',
      order: p.order ?? 0,
      seoTitle: p.seoTitle ?? '',
      seoDescription: p.seoDescription ?? '',
      seoKeywords: p.seoKeywords ?? '',
      createdAt: p.createdAt ?? p.updatedAt ?? new Date().toISOString(),
      updatedAt: p.updatedAt ?? new Date().toISOString(),
    })) as CmsPage[];
  },
  savePages(pages: CmsPage[]) {
    write(KEYS.pages, pages);
    write(KEYS.pageSlugs, pages.map((p) => p.slug));
  },
  addPage(page: Omit<CmsPage, 'id' | 'createdAt' | 'updatedAt'>): CmsPage {
    const pages = cmsStore.getPages();
    const now = new Date().toISOString();
    const newPage: CmsPage = {
      ...page,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    cmsStore.savePages([newPage, ...pages]);
    return newPage;
  },
  /** Call after save — keeps slug list for menu / future build sync */
  syncSlugList(pages: CmsPage[]) {
    write(KEYS.pageSlugs, pages.map((p) => p.slug));
  },
  deletePage(id: string) {
    const pages = cmsStore.getPages().filter((p) => p.id !== id);
    cmsStore.savePages(pages);
  },

  getBlogPosts(): BlogPost[] {
    return read(KEYS.blog, []);
  },
  saveBlogPosts(posts: BlogPost[]) {
    write(KEYS.blog, posts);
  },
  addBlogPost(post: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>): BlogPost {
    const posts = cmsStore.getBlogPosts();
    const now = new Date().toISOString();
    const newPost: BlogPost = {
      ...post,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    cmsStore.saveBlogPosts([newPost, ...posts]);
    return newPost;
  },
};
