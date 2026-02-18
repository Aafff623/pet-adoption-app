-- 更新巴纳比的头像为本地图片
-- 执行前请确保已将图片放入 public/pets/barnaby.png（或 .jpg）
-- 本地开发: /pets/barnaby.png 会解析为 http://localhost:3000/pets/barnaby.png
-- 部署后: /pets/barnaby.png 会解析为你的域名/pets/barnaby.png

UPDATE public.pets
SET image_url = '/pets/barnaby.png'
WHERE id = 'barnaby';
