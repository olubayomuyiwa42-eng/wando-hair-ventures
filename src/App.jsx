import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronLeft,
  Facebook,
  Heart,
  ImagePlus,
  Instagram,
  LoaderCircle,
  LockKeyhole,
  LogOut,
  MapPin,
  Menu,
  MessageCircle,
  Music2,
  Pencil,
  Plus,
  Save,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import { DEMO_PRODUCTS, DEMO_REVIEWS, DEMO_SETTINGS } from './lib/data'
import { isSupabaseConfigured, supabase, uploadPublicImage } from './lib/supabase'

const HERO_IMAGE = 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=1600&q=85'
const FALLBACK_SOCIALS = DEMO_SETTINGS.socials
const EMPTY_PRODUCT = {
  name: '',
  category: 'New arrival',
  description: '',
  price: '',
  length: '',
  texture: '',
  cap_size: 'Medium / adjustable',
  images: [],
  featured: false,
}

function getRoute() {
  const path = window.location.pathname.replace(/\/$/, '') || '/'
  const productMatch = path.match(/^\/product\/([^/]+)$/)
  return productMatch ? { page: 'product', id: productMatch[1] } : { page: path === '/admin' ? 'admin' : 'home' }
}

function useBrowserRoute() {
  const [route, setRoute] = useState(getRoute)
  useEffect(() => {
    const onPopState = () => setRoute(getRoute())
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])
  return route
}

function navigate(path) {
  window.history.pushState({}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function formatMoney(value) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))
}

function normalizeSettings(row) {
  return {
    ...DEMO_SETTINGS,
    ...(row || {}),
    socials: { ...FALLBACK_SOCIALS, ...((row && row.socials) || {}) },
  }
}

function Rating({ value = 5, count, compact = false }) {
  return (
    <span className={`rating ${compact ? 'rating--compact' : ''}`} aria-label={`${value} out of 5 stars`}>
      <span className="rating-stars">{[1, 2, 3, 4, 5].map((star) => <Star key={star} size={compact ? 12 : 14} fill={star <= Math.round(value) ? 'currentColor' : 'none'} />)}</span>
      {count !== undefined && <span className="rating-count">{value.toFixed(1)} ({count})</span>}
    </span>
  )
}

function BrandMark({ settings, onClick }) {
  return (
    <button className="brand" onClick={onClick} aria-label="Back to Wando Hair Ventures home">
      {settings.logo_url ? <img src={settings.logo_url} alt="" className="brand-logo" /> : <span className="brand-monogram">W</span>}
      <span className="brand-copy"><strong>{settings.brand_name}</strong><em>Hair ventures</em></span>
    </button>
  )
}

function Announcement({ text }) {
  const repeated = Array.from({ length: 4 }, (_, index) => <span key={index}><Sparkles size={13} /> {text}</span>)
  return <div className="announcement"><div className="announcement-track">{repeated}</div></div>
}

function Header({ settings }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const go = (href) => { setMobileOpen(false); if (href.startsWith('#')) { navigate('/'); setTimeout(() => document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' }), 30) } else navigate(href) }
  return (
    <>
      <Announcement text={settings.announcement} />
      <header className="site-header">
        <div className="container header-inner">
          <BrandMark settings={settings} onClick={() => go('/')} />
          <nav className={`main-nav ${mobileOpen ? 'main-nav--open' : ''}`}>
            <button onClick={() => go('#collection')}>Shop the edit</button>
            <button onClick={() => go('#story')}>Our story</button>
            <button onClick={() => go('#reviews')}>Love notes</button>
            <button onClick={() => go('#contact')}>Contact</button>
          </nav>
          <div className="header-actions">
            <button className="icon-button header-search" aria-label="Browse collection" onClick={() => go('#collection')}><Search size={18} /></button>
            <button className="header-cta" onClick={() => go('#collection')}>Find your fit <ArrowUpRight size={16} /></button>
            <button className="menu-button" aria-label="Toggle menu" onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? <X size={21} /> : <Menu size={21} />}</button>
          </div>
        </div>
      </header>
    </>
  )
}

function FloralCorners() {
  return <><span className="floral floral--tl">✾</span><span className="floral floral--br">❀</span></>
}

function ProductCard({ product, onOpen }) {
  return (
    <article className="product-card" onClick={() => onOpen(product.id)}>
      <FloralCorners />
      <div className="product-image-wrap">
        <img src={product.images?.[0]} alt={product.name} className="product-image" />
        <button className="product-heart" aria-label={`Save ${product.name}`} onClick={(event) => event.stopPropagation()}><Heart size={17} /></button>
        {product.featured && <span className="pill pill--dark">Bestseller</span>}
      </div>
      <div className="product-card-body">
        <div className="eyebrow-row"><span className="eyebrow">{product.category}</span><Rating value={product.rating || 5} compact /></div>
        <h3>{product.name}</h3>
        <div className="product-meta"><span>{product.length}</span><span className="meta-dot">·</span><span>{product.texture}</span></div>
        <div className="product-card-bottom"><strong>{formatMoney(product.price)}</strong><span className="circle-arrow"><ArrowUpRight size={17} /></span></div>
      </div>
    </article>
  )
}

function Hero({ settings, products, onOpen }) {
  const featured = products.find((product) => product.featured) || products[0]
  return (
    <section className="hero-section" id="story">
      <div className="hero-photo" style={{ backgroundImage: `url(${HERO_IMAGE})` }} />
      <div className="hero-wash" />
      <div className="container hero-grid">
        <div className="hero-copy">
          <div className="section-kicker"><span className="kicker-line" /> Curated hair, considered beautifully</div>
          <h1>Hair that feels like <em>your</em> favorite version of you.</h1>
          <p className="hero-lede">Thoughtful textures, natural movement, and the kind of finish that makes getting ready feel like a ritual.</p>
          <div className="hero-actions"><button className="button button--dark" onClick={() => document.querySelector('#collection')?.scrollIntoView({ behavior: 'smooth' })}>Shop the collection <ArrowUpRight size={17} /></button><button className="text-button" onClick={() => onOpen(featured?.id)}>Meet the bestseller <span>↗</span></button></div>
          <div className="hero-proof"><div className="avatar-stack"><span>AO</span><span>TA</span><span>LK</span></div><div><strong>Loved by 500+ women</strong><span>Soft launches, big energy.</span></div></div>
        </div>
        <div className="hero-aside"><div className="hero-note"><span>01 / 04</span><p>“The texture is gorgeous and the packaging felt like opening a gift.”</p><strong>— Amara O.</strong></div><div className="hero-scroll"><span>Scroll to explore</span><span className="scroll-line" /></div></div>
      </div>
    </section>
  )
}

function Collection({ products, onOpen }) {
  const [activeFilter, setActiveFilter] = useState('All pieces')
  const filters = ['All pieces', 'Signature', 'Everyday edit', 'New arrival']
  const filtered = activeFilter === 'All pieces' ? products : products.filter((item) => item.category.toLowerCase().includes(activeFilter.toLowerCase().replace(' edit', '')) || (activeFilter === 'Signature' && item.category.toLowerCase().includes('signature')))
  return (
    <section className="section collection-section" id="collection">
      <div className="container">
        <div className="section-heading section-heading--split"><div><div className="section-kicker"><span className="kicker-line" /> The edit</div><h2>Pieces with <em>presence.</em></h2></div><p>From soft, everyday movement to your next grand entrance. Every unit is chosen for feel, finish, and the way it makes you stand a little taller.</p></div>
        <div className="filter-row">{filters.map((filter) => <button key={filter} className={activeFilter === filter ? 'filter filter--active' : 'filter'} onClick={() => setActiveFilter(filter)}>{filter}</button>)}<span className="filter-count">{filtered.length} pieces</span></div>
        <div className="product-grid">{filtered.map((product) => <ProductCard key={product.id} product={product} onOpen={onOpen} />)}</div>
        <div className="collection-foot"><span>New drops arrive gently, never randomly.</span><button className="text-button" onClick={() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })}>Need help choosing? <ArrowUpRight size={16} /></button></div>
      </div>
    </section>
  )
}

function ReviewCard({ review }) {
  return <article className="review-card"><div className="review-card-top"><Rating value={review.rating} compact /><span className="review-mark">“</span></div><p>{review.comment}</p><div className="review-author"><span className="author-dot">{review.name?.slice(0, 1) || 'W'}</span><span><strong>{review.name}</strong><small>Verified love note</small></span></div></article>
}

function Reviews({ reviews, onSubmit }) {
  const [form, setForm] = useState({ name: '', rating: 5, comment: '' })
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const submit = async (event) => {
    event.preventDefault()
    if (!form.name.trim() || !form.comment.trim()) return
    setError('')
    try {
      await onSubmit(form)
      setForm({ name: '', rating: 5, comment: '' })
      setSent(true)
      setTimeout(() => setSent(false), 3500)
    } catch (err) {
      setError(err.message || 'We could not send your note. Please try again.')
    }
  }
  return (
    <section className="section review-section" id="reviews">
      <div className="container"><div className="section-heading section-heading--center"><div className="section-kicker"><span className="kicker-line" /> Love notes</div><h2>Good hair gets <em>talked about.</em></h2><p>Real words from women who found their soft landing.</p></div>
        <div className="review-layout"><div className="review-list">{reviews.slice(0, 3).map((review) => <ReviewCard key={review.id} review={review} />)}</div><form className="review-form glass-panel" onSubmit={submit}><div className="form-kicker"><Sparkles size={17} /> Leave a love note</div><h3>Tell us how it feels.</h3><label>Name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" /></label><label>Rating<div className="rating-input">{[1, 2, 3, 4, 5].map((star) => <button key={star} type="button" onClick={() => setForm({ ...form, rating: star })} aria-label={`${star} stars`}><Star size={20} fill={star <= form.rating ? 'currentColor' : 'none'} /></button>)}</div></label><label>Your note<textarea value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} placeholder="Share your Wando moment..." rows="4" /></label>{error && <div className="form-error">{error}</div>}<button className="button button--dark button--full" type="submit">{sent ? <><Check size={16} /> Sent for review</> : <>Share the love <ArrowUpRight size={16} /></>}</button><small className="form-hint">Your note will appear once it has been approved.</small></form></div>
      </div>
    </section>
  )
}
function Footer({ settings, onAdmin }) {
  const socials = settings.socials || FALLBACK_SOCIALS
  const items = [
    { label: 'Instagram', href: socials.instagram, icon: Instagram },
    { label: 'Facebook', href: socials.facebook, icon: Facebook },
    { label: 'Telegram', href: socials.telegram, icon: Send },
    { label: 'TikTok', href: socials.tiktok, icon: Music2 },
    { label: 'WhatsApp', href: socials.whatsapp || `https://wa.me/${settings.whatsapp_number}`, icon: MessageCircle },
  ]
  return <footer className="site-footer" id="contact"><div className="container"><div className="footer-main"><div><BrandMark settings={settings} onClick={() => navigate('/')} /><p className="footer-blurb">Hair that meets you where you are — and takes you somewhere lovely.</p></div><div className="footer-address"><span className="footer-label"><MapPin size={14} /> Visit the studio</span><p>{settings.address}</p><a href={`https://wa.me/${settings.whatsapp_number}`} target="_blank" rel="noreferrer">Book a private fit <ArrowUpRight size={15} /></a></div><div className="footer-connect"><span className="footer-label">Follow the feeling</span><div className="social-row">{items.filter(({ href }) => Boolean(href)).map(({ label, href, icon: Icon }) => <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label}><Icon size={18} /></a>)}</div></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} {settings.brand_name}. Made for your main character days.</span><button className="admin-link" onClick={onAdmin}><LockKeyhole size={13} /> Admin access</button><span>Privacy / care / returns</span></div></div></footer>
}

function Storefront({ settings, products, reviews, onOpen, onReview }) {
  return <><Header settings={settings} /><main><Hero settings={settings} products={products} onOpen={onOpen} /><Collection products={products} onOpen={onOpen} /><section className="quote-banner"><div className="container"><span className="quote-mark">“</span><p>Good hair is not the whole story.<br /><em>But it is a beautiful beginning.</em></p><span className="quote-sparkle">✦</span></div></section><Reviews reviews={reviews} onSubmit={onReview} /></main><Footer settings={settings} onAdmin={() => navigate('/admin')} /></>
}

function ProductDetail({ product, settings, onBack }) {
  const [activeImage, setActiveImage] = useState(0)
  if (!product) return <div className="empty-state"><h2>We couldn't find that piece.</h2><button className="button button--dark" onClick={onBack}>Back to the edit</button></div>
  const orderMessage = encodeURIComponent(`Hi ${settings.brand_name}, I would love to order the ${product.name} (${formatMoney(product.price)}). Please share availability and next steps.`)
  return <><Header settings={settings} /><main className="detail-page"><div className="container"><button className="back-button" onClick={onBack}><ChevronLeft size={18} /> Back to the edit</button><div className="detail-layout"><div className="detail-gallery"><div className="detail-main-image"><img src={product.images?.[activeImage] || HERO_IMAGE} alt={product.name} /><span className="detail-floral">✾</span></div><div className="thumbnail-row">{(product.images || []).map((image, index) => <button key={image} className={activeImage === index ? 'thumbnail thumbnail--active' : 'thumbnail'} onClick={() => setActiveImage(index)}><img src={image} alt="" /></button>)}</div></div><div className="detail-copy"><span className="eyebrow">{product.category}</span><h1>{product.name}</h1><div className="detail-rating"><Rating value={product.rating || 5} count={product.review_count || 0} /></div><strong className="detail-price">{formatMoney(product.price)}</strong><p className="detail-description">{product.description}</p><div className="spec-grid"><div><span>Length</span><strong>{product.length || 'Custom'}</strong></div><div><span>Texture</span><strong>{product.texture || 'Signature'}</strong></div><div><span>Cap fit</span><strong>{product.cap_size || 'Adjustable'}</strong></div><div><span>Care</span><strong>Included guide</strong></div></div><a className="button button--dark button--full" href={`https://wa.me/${settings.whatsapp_number}?text=${orderMessage}`} target="_blank" rel="noreferrer">Order via WhatsApp <MessageCircle size={17} /></a><p className="detail-note"><ShieldCheck size={15} /> Personal fit guidance and aftercare support included.</p></div></div></div></main><Footer settings={settings} onAdmin={() => navigate('/admin')} /></>
}

function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async (event) => { event.preventDefault(); setBusy(true); setError(''); try { await onLogin(email, password) } catch (err) { setError(err.message || 'Could not sign in. Check your details.') } finally { setBusy(false) } }
  return <div className="admin-shell"><div className="admin-login glass-panel"><button className="back-button" onClick={() => navigate('/')}><ChevronLeft size={17} /> Back to storefront</button><div className="admin-lock"><LockKeyhole size={20} /></div><span className="eyebrow">Private studio</span><h1>Welcome behind the scenes.</h1><p>Sign in with the one Supabase Auth user you created for Wando Hair Ventures.</p><form onSubmit={submit}><label>Email<input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required /></label><label>Password<input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" required /></label>{error && <div className="form-error">{error}</div>}<button className="button button--dark button--full" disabled={busy}>{busy ? <><LoaderCircle className="spin" size={16} /> Signing in...</> : <>Enter dashboard <ArrowUpRight size={16} /></>}</button></form>{!isSupabaseConfigured && <div className="setup-notice"><Sparkles size={16} /><span><strong>Preview mode.</strong> Add the two VITE_SUPABASE variables and create your single user to enable real login, data, and uploads.</span></div>}</div></div>
}

function TextInput({ label, value, onChange, type = 'text', placeholder }) {
  return <label>{label}<input type={type} value={value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} /></label>
}

function AdminDashboard({ settings, products, pendingReviews, onSaveSettings, onSaveProduct, onDeleteProduct, onModerateReview, onLogout }) {
  const [tab, setTab] = useState('catalog')
  const [editing, setEditing] = useState(null)
  const [productForm, setProductForm] = useState(EMPTY_PRODUCT)
  const [siteForm, setSiteForm] = useState(settings)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  useEffect(() => setSiteForm(settings), [settings])
  const startNew = () => { setEditing('new'); setProductForm(EMPTY_PRODUCT); setTab('catalog'); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const startEdit = (product) => { setEditing(product.id); setProductForm({ ...product, images: product.images || [] }); setTab('catalog'); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const flash = (text) => { setMessage(text); setTimeout(() => setMessage(''), 3500) }
  const saveProduct = async (event) => { event.preventDefault(); setBusy(true); try { await onSaveProduct(productForm, editing === 'new' ? null : editing); setEditing(null); setProductForm(EMPTY_PRODUCT); flash('Catalog saved beautifully.') } catch (err) { flash(err.message || 'Could not save this piece.') } finally { setBusy(false) } }
  const saveSite = async (event) => { event.preventDefault(); setBusy(true); try { await onSaveSettings(siteForm); flash('Site settings updated.') } catch (err) { flash(err.message || 'Could not update settings.') } finally { setBusy(false) } }
  const updateSocial = (key, value) => setSiteForm({ ...siteForm, socials: { ...siteForm.socials, [key]: value } })
  const upload = async (file, type) => { if (!file) return; setBusy(true); try { const url = await uploadPublicImage(file, type === 'logo' ? 'branding' : 'catalog'); if (type === 'logo') setSiteForm({ ...siteForm, logo_url: url }); else setProductForm({ ...productForm, images: [...(productForm.images || []), url] }); flash('Image uploaded. Remember to save.') } catch (err) { flash(err.message || 'Upload failed. Check the site-assets bucket.') } finally { setBusy(false) } }
  return <div className="admin-shell admin-shell--dashboard"><div className="admin-topbar"><div className="container admin-topbar-inner"><BrandMark settings={settings} onClick={() => navigate('/')} /><div className="admin-top-actions"><span className="admin-status"><span className="status-dot" /> Studio live</span><button className="text-button" onClick={onLogout}><LogOut size={16} /> Sign out</button></div></div></div><div className="container admin-container"><div className="admin-heading"><div><span className="eyebrow">Wando control room</span><h1>Make the edit.</h1><p>Keep the collection feeling fresh, personal, and unmistakably yours.</p></div><button className="button button--dark" onClick={startNew}><Plus size={17} /> Add a piece</button></div>{message && <div className="toast"><Check size={16} /> {message}</div>}<div className="admin-tabs"><button className={tab === 'catalog' ? 'admin-tab admin-tab--active' : 'admin-tab'} onClick={() => setTab('catalog')}>Catalog <span>{products.length}</span></button><button className={tab === 'settings' ? 'admin-tab admin-tab--active' : 'admin-tab'} onClick={() => setTab('settings')}>Site settings</button><button className={tab === 'reviews' ? 'admin-tab admin-tab--active' : 'admin-tab'} onClick={() => setTab('reviews')}>Review queue <span>{pendingReviews.length}</span></button></div>{tab === 'catalog' && <div className="admin-grid"><section className="admin-card admin-card--wide">{editing && <form className="editor-form" onSubmit={saveProduct}><div className="editor-heading"><div><span className="eyebrow">{editing === 'new' ? 'New piece' : 'Edit piece'}</span><h2>{editing === 'new' ? 'Add to the edit.' : productForm.name}</h2></div><button type="button" className="icon-button" onClick={() => setEditing(null)}><X size={18} /></button></div><div className="form-grid"><TextInput label="Piece name" value={productForm.name} onChange={(value) => setProductForm({ ...productForm, name: value })} placeholder="e.g. Cloud Nine Body Wave" /><TextInput label="Category" value={productForm.category} onChange={(value) => setProductForm({ ...productForm, category: value })} placeholder="Signature collection" /><TextInput label="Price (NGN)" type="number" value={productForm.price} onChange={(value) => setProductForm({ ...productForm, price: value })} placeholder="185000" /><TextInput label="Length" value={productForm.length} onChange={(value) => setProductForm({ ...productForm, length: value })} placeholder="22 inches" /><TextInput label="Texture" value={productForm.texture} onChange={(value) => setProductForm({ ...productForm, texture: value })} placeholder="Body wave" /><TextInput label="Cap size" value={productForm.cap_size} onChange={(value) => setProductForm({ ...productForm, cap_size: value })} placeholder="Medium / adjustable" /></div><label>Description<textarea value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} rows="4" placeholder="Describe the texture, fit, and feeling..." /></label><div className="upload-box"><div className="upload-copy"><ImagePlus size={22} /><span><strong>Product images</strong><small>Use the uploader after connecting Supabase, or paste public image URLs below.</small></span></div><label className="upload-button"><Upload size={15} /> Upload image<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => upload(e.target.files?.[0], 'product')} hidden /></label><textarea value={(productForm.images || []).join('\n')} onChange={(e) => setProductForm({ ...productForm, images: e.target.value.split('\n').map((value) => value.trim()).filter(Boolean) })} rows="3" placeholder="https://... one image URL per line" /></div><label className="checkbox-row"><input type="checkbox" checked={Boolean(productForm.featured)} onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })} /><span>Feature this piece on the storefront</span></label><div className="editor-actions"><button type="button" className="button button--soft" onClick={() => setEditing(null)}>Cancel</button><button className="button button--dark" disabled={busy}>{busy ? <LoaderCircle className="spin" size={16} /> : <Save size={16} />} Save piece</button></div></form>}<div className="inventory-heading"><div><span className="eyebrow">Your collection</span><h2>{products.length} pieces live</h2></div><button className="button button--soft" onClick={startNew}><Plus size={16} /> Add piece</button></div><div className="inventory-list">{products.map((product) => <div className="inventory-item" key={product.id}><img src={product.images?.[0] || HERO_IMAGE} alt="" /><div className="inventory-info"><strong>{product.name}</strong><span>{product.category} · {formatMoney(product.price)}</span></div><div className="inventory-actions"><button className="icon-button" onClick={() => startEdit(product)} aria-label={`Edit ${product.name}`}><Pencil size={16} /></button><button className="icon-button icon-button--danger" onClick={() => onDeleteProduct(product.id)} aria-label={`Delete ${product.name}`}><Trash2 size={16} /></button></div></div>)}</div></section><aside className="admin-card admin-card--aside"><span className="eyebrow">Quick note</span><h3>Keep the feeling consistent.</h3><p>Clean imagery, specific details, and a warm WhatsApp handoff make it easy for a visitor to say yes.</p><div className="aside-rule" /><span className="aside-stat">{products.filter((product) => product.featured).length}<small> featured pieces</small></span></aside></div>}{tab === 'settings' && <form className="admin-card settings-card" onSubmit={saveSite}><div className="editor-heading"><div><span className="eyebrow">Brand controls</span><h2>Shape the storefront.</h2><p>These details flow through the header, hero, footer, and WhatsApp handoff.</p></div><button className="button button--dark" disabled={busy}>{busy ? <LoaderCircle className="spin" size={16} /> : <Save size={16} />} Save settings</button></div><div className="settings-section"><h3>Identity</h3><div className="form-grid"><TextInput label="Website name" value={siteForm.brand_name} onChange={(value) => setSiteForm({ ...siteForm, brand_name: value })} placeholder="Wando Hair Ventures" /><TextInput label="Announcement bar copy" value={siteForm.announcement} onChange={(value) => setSiteForm({ ...siteForm, announcement: value })} placeholder="15% off selected units this week" /></div><div className="logo-upload"><div className="logo-preview">{siteForm.logo_url ? <img src={siteForm.logo_url} alt="Logo preview" /> : <span>W</span>}</div><div><strong>Brand logo</strong><p>Upload a mark or paste a public image URL.</p><label className="upload-button"><Upload size={15} /> Upload logo<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => upload(e.target.files?.[0], 'logo')} hidden /></label></div><input value={siteForm.logo_url || ''} onChange={(e) => setSiteForm({ ...siteForm, logo_url: e.target.value })} placeholder="https://... logo URL" /></div></div><div className="settings-section"><h3>Studio details</h3><div className="form-grid"><TextInput label="Address" value={siteForm.address} onChange={(value) => setSiteForm({ ...siteForm, address: value })} placeholder="14 Rosewood Lane, Lagos" /><TextInput label="WhatsApp number" value={siteForm.whatsapp_number} onChange={(value) => setSiteForm({ ...siteForm, whatsapp_number: value })} placeholder="2348030000000" /></div></div><div className="settings-section"><h3>Social links</h3><div className="form-grid"><TextInput label="Instagram" value={siteForm.socials?.instagram} onChange={(value) => updateSocial('instagram', value)} placeholder="https://instagram.com/..." /><TextInput label="Facebook" value={siteForm.socials?.facebook} onChange={(value) => updateSocial('facebook', value)} placeholder="https://facebook.com/..." /><TextInput label="Telegram" value={siteForm.socials?.telegram} onChange={(value) => updateSocial('telegram', value)} placeholder="https://t.me/..." /><TextInput label="TikTok" value={siteForm.socials?.tiktok} onChange={(value) => updateSocial('tiktok', value)} placeholder="https://tiktok.com/@..." /><TextInput label="WhatsApp link" value={siteForm.socials?.whatsapp} onChange={(value) => updateSocial('whatsapp', value)} placeholder="https://wa.me/..." /></div></div></form>}{tab === 'reviews' && <section className="admin-card guide-card"><div className="review-queue-heading"><div><span className="eyebrow">Customer voice</span><h2>Review queue.</h2><p>Approve notes before they reach the storefront.</p></div><span className="queue-count">{pendingReviews.length} waiting</span></div><div className="pending-review-list">{pendingReviews.length ? pendingReviews.map((review) => <div className="pending-review" key={review.id}><div><Rating value={review.rating} compact /><strong>{review.name}</strong><p>{review.comment}</p></div><div className="pending-actions"><button className="button button--soft" onClick={() => onModerateReview(review, false)}><Trash2 size={14} /> Reject</button><button className="button button--dark" onClick={() => onModerateReview(review, true)}><Check size={14} /> Approve</button></div></div>) : <div className="empty-review"><Check size={18} /><span>No notes waiting. Your queue is beautifully quiet.</span></div>}</div><div className="guide-steps"><div><span>01</span><strong>Run SUPABASE_SETUP.md</strong><p>Paste the schema in Supabase SQL editor to create tables, policies, and the public asset bucket.</p></div><div><span>02</span><strong>Allowlist one Auth user</strong><p>Add the sole Auth user's UUID to admin_users. Every other account is read-only.</p></div><div><span>03</span><strong>Deploy with two variables</strong><p>Vercel and Cloudflare Pages only need VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.</p></div></div></section>}</div></div>
}

export default function App() {
  const route = useBrowserRoute()
  const [settings, setSettings] = useState(DEMO_SETTINGS)
  const [products, setProducts] = useState(DEMO_PRODUCTS)
  const [reviews, setReviews] = useState(DEMO_REVIEWS)
  const [pendingReviews, setPendingReviews] = useState([])
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      if (!supabase) { setLoading(false); return }
      const [{ data: settingsRow }, { data: productRows }, { data: reviewRows }, { data: authData }] = await Promise.all([
        supabase.from('site_settings').select('*').eq('id', 1).maybeSingle(),
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('reviews').select('*').order('created_at', { ascending: false }),
        supabase.auth.getSession(),
      ])
      if (!mounted) return
      if (settingsRow) setSettings(normalizeSettings(settingsRow))
      if (productRows) setProducts(productRows)
      if (reviewRows) { setReviews(reviewRows.filter((review) => review.approved)); setPendingReviews(reviewRows.filter((review) => !review.approved)) }
      let activeSession = authData?.session || null
      if (activeSession) {
        const { data: adminRow } = await supabase.from('admin_users').select('id').eq('id', activeSession.user.id).maybeSingle()
        if (!adminRow) activeSession = null
      }
      setSession(activeSession)
      setLoading(false)
    }
    load()
    if (!supabase) return () => { mounted = false }
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => setSession(newSession))
    return () => { mounted = false; listener.subscription.unsubscribe() }
  }, [])

  const selectedProduct = useMemo(() => products.find((product) => product.id === route.id), [products, route.id])
  const handleLogin = async (email, password) => {
    if (!supabase) { if (password.length < 4) throw new Error('Preview mode needs a password with 4+ characters.') ; setSession({ user: { email: email || 'preview@wandohair.com' } }); return }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    const { data: adminRow, error: adminError } = await supabase.from('admin_users').select('id').eq('id', data.user.id).maybeSingle()
    if (adminError) { await supabase.auth.signOut(); throw new Error('Run SUPABASE_SETUP.md to create the admin allowlist first.') }
    if (!adminRow) { await supabase.auth.signOut(); throw new Error('This account is not the configured Wando studio admin.') }
    const { data: pending } = await supabase.from('reviews').select('*').eq('approved', false).order('created_at', { ascending: false })
    setPendingReviews(pending || [])
    setSession(data.session)
  }
  const handleLogout = async () => { if (supabase) await supabase.auth.signOut(); setSession(null); navigate('/') }
  const handleReview = async (review) => {
    if (supabase) {
      const { error } = await supabase.from('reviews').insert({ ...review, approved: false })
      if (error) throw error
    } else setReviews((current) => [{ ...review, id: crypto.randomUUID(), created_at: new Date().toISOString() }, ...current])
  }
  const moderateReview = async (review, approved) => {
    if (supabase) {
      const result = approved ? await supabase.from('reviews').update({ approved: true }).eq('id', review.id) : await supabase.from('reviews').delete().eq('id', review.id)
      if (result.error) throw result.error
    }
    setPendingReviews((current) => current.filter((item) => item.id !== review.id))
    if (approved) setReviews((current) => [{ ...review, approved: true }, ...current])
  }
  const saveProduct = async (draft, editingId) => {
    const payload = { ...draft, price: Number(draft.price || 0), images: draft.images || [] }
    if (supabase) {
      const result = editingId ? await supabase.from('products').update(payload).eq('id', editingId).select().single() : await supabase.from('products').insert(payload).select().single()
      if (result.error) throw result.error
      setProducts((current) => editingId ? current.map((item) => item.id === editingId ? result.data : item) : [result.data, ...current])
    } else setProducts((current) => editingId ? current.map((item) => item.id === editingId ? { ...item, ...payload } : item) : [{ ...payload, id: crypto.randomUUID(), rating: 5, review_count: 0 }, ...current])
  }
  const deleteProduct = async (id) => {
    if (!window.confirm('Remove this piece from the edit?')) return
    if (supabase) { const { error } = await supabase.from('products').delete().eq('id', id); if (error) throw error }
    setProducts((current) => current.filter((item) => item.id !== id))
  }
  const saveSettings = async (draft) => {
    const payload = { ...draft, id: 1 }
    if (supabase) { const { data, error } = await supabase.from('site_settings').upsert(payload).select().single(); if (error) throw error; setSettings(normalizeSettings(data)) } else setSettings(normalizeSettings(payload))
  }

  if (loading) return <div className="loading-screen"><div className="brand-monogram">W</div><LoaderCircle className="spin" size={20} /><span>Preparing your edit...</span></div>
  if (route.page === 'admin') return session ? <AdminDashboard settings={settings} products={products} pendingReviews={pendingReviews} onSaveSettings={saveSettings} onSaveProduct={saveProduct} onDeleteProduct={deleteProduct} onModerateReview={moderateReview} onLogout={handleLogout} /> : <AdminLogin onLogin={handleLogin} />
  if (route.page === 'product') return <ProductDetail product={selectedProduct} settings={settings} onBack={() => navigate('/')} />
  return <Storefront settings={settings} products={products} reviews={reviews} onOpen={(id) => navigate(`/product/${id}`)} onReview={handleReview} />
}
