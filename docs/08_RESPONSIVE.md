# 08 — Responsive + Карта страниц

## Брейкпоинты
- **mobile** `< 768px` — бургер-меню, drawer (sheet) для корзины/фильтров, 1 колонка, упрощённые формы.
- **tablet** `768–1023px` — 2–3 колонки, фильтры в drawer.
- **desktop** `≥ 1024px` — полный layout, фильтры сайдбаром.

Mobile-first. Для каждой страницы проверять в Figma наличие mobile-фрейма (в макете есть и desktop, и mobile версии) и повторять его.

## Контейнер / layout
`max-w-[1170px] mx-auto px-4`. Layout-обёртка с Header (widgets) + `<Outlet/>` + Footer. Auth-страницы (`/login`, `/register`) и 404 — без обычного Header/Footer по правилу 12 CLAUDE.md.

---

## Карта роутов (ВСЕ страницы)

| Route | Страница (папка) | Доступ | Figma-экран |
|---|---|---|---|
| `/` | `home` | публ. | E-Commerce HomePage |
| `/login` | `login` | гость | Log In |
| `/register` | `register` | гость | Sign Up |
| `/products` | `product-list` | публ. | E-Commerce Products |
| `/product/:id` | `product-detail` | публ. | Product Details page |
| `/wishlist` | `wishlist` | клиент* | Wishlist |
| `/cart` | `cart` | User+ | Cart |
| `/checkout` | `checkout` | User+ | CheckOut |
| `/profile` | `profile` | User+ | Account |
| `/about` | `about` | публ. | About |
| `/contact` | `contact` | публ. | Contact |
| `*` | `not-found` | публ. | 404 Error |

\* Wishlist хранится на клиенте; гостю — приглашение залогиниться.
> **Новые страницы, которых не было в исходной `src/pages/`:** `wishlist`, `about`, `contact`. Добавить.

---

## Содержимое страниц (секции — строить по Figma)

### Общий layout (Header / Footer — widgets)
- **TopBar:** чёрная плашка, по центру промо «Up to 10% off Voucher», справа выбор языка.
- **Header:** лого Fastcart · навигация Home / Contact / About / Sign Up · поиск · **LangSwitcher + ThemeToggle** (добавляем сами, docs/04) · иконки Wishlist / Cart / Account.
- **Footer:** 5 колонок — Exclusive (подписка на email), Support (адрес/email/телефон), Account (My Account, Login/Register, Cart, Wishlist, Shop), Quick Link (Privacy, Terms, FAQ, Contact), Download App + соцсети. Чёрный фон. Строка копирайта снизу.

### `/` Home
1. **Hero:** слева вертикальное меню категорий (`GET /Category/get-categories`), справа баннер-карусель (embla, автоплей).
2. **Flash Sales:** красный таб-заголовок, **таймер обратного отсчёта** (Дни:Часы:Мин:Сек), горизонтальная карусель товаров, кнопка «View All Products».
3. **Browse By Category:** строка плиток категорий (иконка + имя), стрелки прокрутки, активная — красная.
4. **Best Selling Products:** «View All» + ряд из 4 карточек.
5. **Промо-баннер:** тёмный «Enhance Your Music Experience» + свой таймер + зелёная кнопка «Buy Now!» + картинка товара.
6. **Explore Our Products:** сетка 2×4 карточек + «View All Products».
7. **New Arrival:** асимметричная сетка (1 большой + 3 маленьких).
8. **Services bar:** Free & Fast Delivery, 24/7 Customer Service, Money Back Guarantee.

### `/register` Sign Up
Сплит: слева иллюстрация, справа форма «Create an account» — Name (userName), Email, Password (+ phoneNumber, confirmPassword по docs/06). Кнопка «Create Account» (красная), «Sign up with Google» (outline, опц./мок), ссылка «Already have account? Log in».

### `/login` Log In
Сплит так же. Поля Email/userName + Password. «Log In» (красная) + «Forgot Password?» (красная ссылка). Успех → сохранить JWT, редирект.

### `/products` Product List
Слева **фильтры:** Categories+SubCategories, Brands, Colors, Price (Min/Max). Справа сетка карточек + **пагинация** (PageNumber/PageSize), заголовок с сортировкой и количеством. Фильтры → query `GET /Product/get-products` (debounce). **204 → EmptyState.** На мобиле фильтры в sheet.

### `/product/:id` Product Detail
`GET /Product/get-product-by-id`. Слева колонка превью + основное фото (галерея). Справа: название, звёзды + кол-во отзывов, цена, статус наличия, описание, выбор **цвета**, **размера**, степпер количества, «Buy Now» (красная) + wishlist (сердце), блоки доставки/возврата. Ниже — «Related Item» карусель (та же категория/подкатегория). Add-to-cart → `POST /Cart/add-product-to-cart?id`.

### `/wishlist` Wishlist
Заголовок «Wishlist (N)» + «Move All To Bag». Сетка избранного (бейдж скидки, иконка удаления, add-to-cart). Ниже «Just For You» — рекомендации. Данные из `wishlistSlice` (резолв каждого id из кэша/деталей).

### `/cart` Cart
`GET /Cart/get-products-from-cart`. Таблица: Product (фото+имя), Price, Quantity (степпер → increase/reduce), Subtotal, удаление. «Return To Shop» + «Update Cart». Купон + «Apply Coupon» (мок). Блок **Cart Total**: Subtotal, Shipping (Free), Total, «Proceed to checkout» → `/checkout`. Пусто → EmptyState.

### `/checkout` Checkout
Слева **Billing Details** (First Name, Company, Street Address, Apartment, Town/City, Phone, Email, чекбокс «save info»). Справа — сводка заказа (товары + суммы), способ оплаты (Bank / Cash on delivery), купон, «Place Order» (красная). ⚠️ Эндпоинта заказа нет (docs/03): по submit → `clear-cart` + экран успеха.

### `/profile` Account
Слева навигация: Manage My Account (My Profile, Address Book, My Payment Options), My Orders, My Wishlist. Справа **Edit Your Profile** (First/Last Name, Email, Address, смена пароля). Save → `PUT /UserProfile/update-user-profile` (multipart). В хлебных крошках «Welcome! {name}».

### `/about` About
«Our Story» текст + фото. Карточки статистики (sellers / sales / customers / revenue), активная — красная. Карточки команды (фото, имя, роль, соцсети). Services bar (переиспользовать).

### `/contact` Contact
Слева карточка контактов (Call To Us + Write To Us, телефон/email). Справа форма (Name, Email, Phone, Message) + «Send Message» (красная). Отправка — мок/клиент.

### `*` 404
По центру «404 Not Found» + подпись + кнопка «Back to home page». Header/Footer присутствуют.
