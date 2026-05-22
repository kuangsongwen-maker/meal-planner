// ============================================================
// 三餐规划 App v2
// ============================================================

const STORAGE_KEY = 'mealplanner_v2';
const DAY_LABELS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
const MEAL_TYPES = ['breakfast', 'lunch', 'dinner'];
const MEAL_LABELS = ['早餐', '午餐', '晚餐'];

// 中→英 常见食材翻译（用于 OpenFoodFacts 在线搜索）
const INGREDIENT_TRANSLATIONS = {
  '鸡蛋': 'egg', '鸡胸肉': 'chicken breast', '鸡腿': 'chicken leg', '鸡翅': 'chicken wing',
  '猪肉': 'pork', '猪瘦肉': 'pork lean', '五花肉': 'pork belly', '排骨': 'pork rib',
  '牛肉': 'beef', '牛腩': 'beef brisket', '牛腱': 'beef shank', '肥牛': 'beef brisket',
  '羊肉': 'lamb', '鸭肉': 'duck',
  '虾': 'shrimp', '虾仁': 'shrimp', '鱼': 'fish', '鲈鱼': 'sea bass', '三文鱼': 'salmon',
  '螃蟹': 'crab', '蛤蜊': 'clam', '鱿鱼': 'squid', '带鱼': 'hairtail',
  '豆腐': 'tofu', '豆干': 'tofu dried', '腐竹': 'tofu skin', '豆浆': 'soy milk',
  '大米': 'rice', '米饭': 'rice cooked', '面条': 'noodle', '面粉': 'flour', '馒头': 'steamed bun',
  '小米': 'millet', '玉米': 'corn', '红薯': 'sweet potato', '燕麦': 'oat', '面包': 'bread',
  '牛奶': 'milk', '酸奶': 'yogurt', '奶酪': 'cheese',
  '大白菜': 'napa cabbage', '生菜': 'lettuce', '菠菜': 'spinach', '西兰花': 'broccoli',
  '西红柿': 'tomato', '黄瓜': 'cucumber', '胡萝卜': 'carrot', '土豆': 'potato',
  '茄子': 'eggplant', '青椒': 'green pepper', '四季豆': 'green bean', '洋葱': 'onion',
  '芹菜': 'celery', '南瓜': 'pumpkin', '冬瓜': 'winter melon', '白萝卜': 'white radish',
  '豆芽': 'bean sprout', '韭菜': 'chive', '蒜苗': 'garlic sprout', '木耳': 'wood ear mushroom',
  '香菇': 'shiitake', '花生': 'peanut', '红枣': 'jujube', '枸杞': 'goji berry',
  '紫菜': 'seaweed', '虾皮': 'dried shrimp', '食用油': 'cooking oil', '酱油': 'soy sauce',
  '醋': 'vinegar', '白糖': 'sugar', '蚝油': 'oyster sauce', '豆瓣酱': 'doubanjiang chili paste',
  '香油': 'sesame oil', '花椒': 'sichuan pepper', '盐': 'salt', '料酒': 'cooking wine'
};

// ============ 烹饪方式 ============
const COOKING_METHODS = [
  { id: 'cm_steam', name: '蒸', multiplier: 1.0, desc: '不额外加油' },
  { id: 'cm_boil', name: '煮 / 白灼', multiplier: 1.0, desc: '水煮，不额外加油' },
  { id: 'cm_cold', name: '凉拌', multiplier: 1.0, desc: '少量调味' },
  { id: 'cm_stir_fry', name: '炒', multiplier: 1.1, desc: '常规用油' },
  { id: 'cm_pan_fry', name: '煎', multiplier: 1.15, desc: '中等油量' },
  { id: 'cm_braise', name: '红烧 / 焖', multiplier: 1.12, desc: '糖+油慢炖' },
  { id: 'cm_roast', name: '烤', multiplier: 1.05, desc: '烤箱/空气炸锅' },
  { id: 'cm_deep_fry', name: '炸', multiplier: 1.3, desc: '大量油' },
  { id: 'cm_stew', name: '炖 / 煲汤', multiplier: 1.03, desc: '长时间水炖' }
];

// ============ 日常活动水平（PAL = Physical Activity Level，FAO/WHO标准）============
// PAL = TDEE / BMR，含NEAT(非运动消耗) + TEF(食物热效应约10%)
// 参考: FAO/WHO/UNU Expert Consultation 2004
const DAILY_PAL_OPTIONS = [
  { value: '1.4', label: '久坐办公（程序员、文员、司机等）', desc: '全天坐着工作，BMR×1.4' },
  { value: '1.5', label: '久坐+偶尔走动（设计师、学生等）', desc: '大部分时间坐着，偶尔活动' },
  { value: '1.6', label: '轻度活动（教师、销售、护士等）', desc: '经常站立或走动，BMR×1.6' },
  { value: '1.8', label: '中度体力（服务员、护工、流水线工人等）', desc: '持续走动或轻度体力劳动' },
  { value: '2.0', label: '重度体力（建筑工、农活、搬运工等）', desc: '高强度体力劳动，BMR×2.0' },
  { value: '2.2', label: '极重度（职业运动员、矿工、军人等）', desc: '极高强度活动或训练' }
];

// ============ 运动锻炼消耗（平均到每天，按每次运动消耗300-500kcal估算）============
const EXERCISE_OPTIONS = [
  { value: '0', label: '几乎不运动', desc: '无规律运动，日均 +0 kcal' },
  { value: '120', label: '每周1-2次', desc: '散步/瑜伽/轻度球类，日均 +120 kcal' },
  { value: '280', label: '每周3-4次', desc: '跑步/游泳/力量训练，日均 +280 kcal' },
  { value: '430', label: '每周5-6次', desc: '中高强度训练，日均 +430 kcal' },
  { value: '600', label: '每天高强度训练', desc: '竞技体育或职业训练，日均 +600 kcal' }
];

// ============ 运动预设（精细模式用，MET值参考Ainsworth 2011）============
const EXERCISE_PRESETS = [
  { id: 'rest', name: '休息', met: 0, duration: 0 },
  { id: 'walk30', name: '快走 30分', met: 4.5, duration: 0.5 },
  { id: 'walk60', name: '快走 60分', met: 4.5, duration: 1.0 },
  { id: 'run30', name: '跑步 30分', met: 8.0, duration: 0.5 },
  { id: 'run45', name: '跑步 45分', met: 8.0, duration: 0.75 },
  { id: 'swim30', name: '游泳 30分', met: 7.0, duration: 0.5 },
  { id: 'swim45', name: '游泳 45分', met: 7.0, duration: 0.75 },
  { id: 'strength45', name: '力量训练 45分', met: 5.0, duration: 0.75 },
  { id: 'strength60', name: '力量训练 60分', met: 5.0, duration: 1.0 },
  { id: 'bike45', name: '骑行 45分', met: 6.0, duration: 0.75 },
  { id: 'yoga60', name: '瑜伽 60分', met: 2.5, duration: 1.0 },
  { id: 'custom_kcal', name: '自定义 kcal', met: null, duration: null }
];

// ============ 预设食材库 (80+ items, calories per 100g, +钠/纤维/饱和脂肪/糖) ============
const PRESET_INGREDIENTS = [
  // 蔬菜类 (20)
  { id: 'veg_napa', name: '大白菜', category: '蔬菜', calories: 13, protein: 1.5, carbs: 2.2, fat: 0.2, sodium: 57, fiber: 1.0, saturatedFat: 0.0, sugar: 2.0, isBuiltin: true },
  { id: 'veg_lettuce', name: '生菜', category: '蔬菜', calories: 15, protein: 1.4, carbs: 2.1, fat: 0.3, sodium: 35, fiber: 1.3, saturatedFat: 0.0, sugar: 1.0, isBuiltin: true },
  { id: 'veg_spinach', name: '菠菜', category: '蔬菜', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, sodium: 79, fiber: 2.2, saturatedFat: 0.1, sugar: 0.4, isBuiltin: true },
  { id: 'veg_broccoli', name: '西兰花', category: '蔬菜', calories: 34, protein: 2.8, carbs: 6.6, fat: 0.4, sodium: 33, fiber: 2.6, saturatedFat: 0.1, sugar: 1.7, isBuiltin: true },
  { id: 'veg_tomato', name: '西红柿', category: '蔬菜', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, sodium: 5, fiber: 1.2, saturatedFat: 0.0, sugar: 2.6, isBuiltin: true },
  { id: 'veg_cucumber', name: '黄瓜', category: '蔬菜', calories: 15, protein: 0.7, carbs: 2.9, fat: 0.1, sodium: 5, fiber: 0.5, saturatedFat: 0.0, sugar: 1.7, isBuiltin: true },
  { id: 'veg_carrot', name: '胡萝卜', category: '蔬菜', calories: 37, protein: 1.0, carbs: 8.8, fat: 0.2, sodium: 69, fiber: 2.8, saturatedFat: 0.0, sugar: 4.7, isBuiltin: true },
  { id: 'veg_radish', name: '白萝卜', category: '蔬菜', calories: 16, protein: 0.7, carbs: 3.4, fat: 0.1, sodium: 65, fiber: 1.6, saturatedFat: 0.0, sugar: 2.5, isBuiltin: true },
  { id: 'veg_potato', name: '土豆', category: '蔬菜', calories: 81, protein: 2.0, carbs: 17.5, fat: 0.2, sodium: 6, fiber: 2.2, saturatedFat: 0.0, sugar: 0.8, isBuiltin: true },
  { id: 'veg_eggplant', name: '茄子', category: '蔬菜', calories: 21, protein: 1.1, carbs: 4.9, fat: 0.2, sodium: 4, fiber: 1.7, saturatedFat: 0.0, sugar: 3.5, isBuiltin: true },
  { id: 'veg_green_pepper', name: '青椒', category: '蔬菜', calories: 22, protein: 1.0, carbs: 4.6, fat: 0.2, sodium: 3, fiber: 1.7, saturatedFat: 0.0, sugar: 2.4, isBuiltin: true },
  { id: 'veg_green_beans', name: '四季豆', category: '蔬菜', calories: 31, protein: 2.0, carbs: 5.7, fat: 0.3, sodium: 5, fiber: 2.7, saturatedFat: 0.0, sugar: 1.8, isBuiltin: true },
  { id: 'veg_winter_melon', name: '冬瓜', category: '蔬菜', calories: 11, protein: 0.4, carbs: 2.6, fat: 0.1, sodium: 2, fiber: 1.1, saturatedFat: 0.0, sugar: 1.6, isBuiltin: true },
  { id: 'veg_pumpkin', name: '南瓜', category: '蔬菜', calories: 26, protein: 0.7, carbs: 6.5, fat: 0.1, sodium: 2, fiber: 1.1, saturatedFat: 0.0, sugar: 1.3, isBuiltin: true },
  { id: 'veg_celery', name: '芹菜', category: '蔬菜', calories: 14, protein: 0.8, carbs: 2.5, fat: 0.1, sodium: 80, fiber: 1.6, saturatedFat: 0.0, sugar: 1.8, isBuiltin: true },
  { id: 'veg_onion', name: '洋葱', category: '蔬菜', calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, sodium: 4, fiber: 1.7, saturatedFat: 0.0, sugar: 4.2, isBuiltin: true },
  { id: 'veg_garlic_sprout', name: '蒜苗', category: '蔬菜', calories: 30, protein: 2.1, carbs: 5.8, fat: 0.3, sodium: 10, fiber: 1.8, saturatedFat: 0.0, sugar: 2.5, isBuiltin: true },
  { id: 'veg_chive', name: '韭菜', category: '蔬菜', calories: 26, protein: 2.4, carbs: 3.8, fat: 0.4, sodium: 8, fiber: 1.8, saturatedFat: 0.0, sugar: 2.4, isBuiltin: true },
  { id: 'veg_bean_sprout', name: '豆芽', category: '蔬菜', calories: 18, protein: 2.1, carbs: 2.3, fat: 0.3, sodium: 5, fiber: 1.3, saturatedFat: 0.0, sugar: 1.0, isBuiltin: true },
  { id: 'veg_wood_ear', name: '木耳(干)', category: '干货', calories: 265, protein: 10.6, carbs: 65.5, fat: 0.2, sodium: 30, fiber: 30.0, saturatedFat: 0.0, sugar: 0.5, isBuiltin: true },
  // 肉类 (12)
  { id: 'meat_pork_lean', name: '猪瘦肉', category: '肉类', calories: 143, protein: 20.3, carbs: 1.5, fat: 6.2, sodium: 57, fiber: 0, saturatedFat: 2.5, sugar: 0, isBuiltin: true },
  { id: 'meat_pork_belly', name: '猪五花肉', category: '肉类', calories: 518, protein: 9.3, carbs: 0, fat: 52.3, sodium: 43, fiber: 0, saturatedFat: 19.0, sugar: 0, isBuiltin: true },
  { id: 'meat_pork_rib', name: '猪排骨', category: '肉类', calories: 264, protein: 18.3, carbs: 0, fat: 20.4, sodium: 62, fiber: 0, saturatedFat: 8.0, sugar: 0, isBuiltin: true },
  { id: 'meat_beef_brisket', name: '牛腩', category: '肉类', calories: 250, protein: 17.6, carbs: 0, fat: 20.1, sodium: 53, fiber: 0, saturatedFat: 8.0, sugar: 0, isBuiltin: true },
  { id: 'meat_beef_lean', name: '牛瘦肉', category: '肉类', calories: 106, protein: 20.2, carbs: 1.2, fat: 2.3, sodium: 48, fiber: 0, saturatedFat: 0.9, sugar: 0, isBuiltin: true },
  { id: 'meat_chicken_breast', name: '鸡胸肉', category: '肉类', calories: 133, protein: 19.4, carbs: 2.5, fat: 5.0, sodium: 44, fiber: 0, saturatedFat: 1.2, sugar: 0, isBuiltin: true },
  { id: 'meat_chicken_thigh', name: '鸡腿肉', category: '肉类', calories: 181, protein: 16.4, carbs: 0, fat: 13.0, sodium: 63, fiber: 0, saturatedFat: 3.5, sugar: 0, isBuiltin: true },
  { id: 'meat_chicken_wing', name: '鸡翅', category: '肉类', calories: 222, protein: 17.5, carbs: 0, fat: 16.5, sodium: 58, fiber: 0, saturatedFat: 4.5, sugar: 0, isBuiltin: true },
  { id: 'meat_duck', name: '鸭肉', category: '肉类', calories: 240, protein: 15.5, carbs: 0.2, fat: 19.7, sodium: 69, fiber: 0, saturatedFat: 6.0, sugar: 0, isBuiltin: true },
  { id: 'meat_lamb', name: '羊腿肉', category: '肉类', calories: 205, protein: 19.0, carbs: 0, fat: 14.1, sodium: 69, fiber: 0, saturatedFat: 5.0, sugar: 0, isBuiltin: true },
  { id: 'meat_bacon', name: '培根', category: '肉类', calories: 540, protein: 12.0, carbs: 1.0, fat: 55.0, sodium: 1500, fiber: 0, saturatedFat: 20.0, sugar: 0, isBuiltin: true },
  { id: 'meat_beef_slice', name: '肥牛', category: '肉类', calories: 313, protein: 16.0, carbs: 0, fat: 28.0, sodium: 45, fiber: 0, saturatedFat: 11.0, sugar: 0, isBuiltin: true },
  // 海鲜 (8)
  { id: 'seafood_shrimp', name: '虾仁', category: '海鲜', calories: 60, protein: 13.3, carbs: 0.2, fat: 0.9, sodium: 165, fiber: 0, saturatedFat: 0.2, sugar: 0, isBuiltin: true },
  { id: 'seafood_bass', name: '鲈鱼', category: '海鲜', calories: 105, protein: 18.6, carbs: 0, fat: 3.4, sodium: 55, fiber: 0, saturatedFat: 0.8, sugar: 0, isBuiltin: true },
  { id: 'seafood_carp', name: '草鱼', category: '海鲜', calories: 113, protein: 16.6, carbs: 0, fat: 5.2, sodium: 46, fiber: 0, saturatedFat: 1.0, sugar: 0, isBuiltin: true },
  { id: 'seafood_hairtail', name: '带鱼', category: '海鲜', calories: 127, protein: 17.7, carbs: 0, fat: 4.9, sodium: 65, fiber: 0, saturatedFat: 1.2, sugar: 0, isBuiltin: true },
  { id: 'seafood_salmon', name: '三文鱼', category: '海鲜', calories: 208, protein: 20.4, carbs: 0, fat: 13.4, sodium: 59, fiber: 0, saturatedFat: 3.0, sugar: 0, isBuiltin: true },
  { id: 'seafood_clam', name: '蛤蜊', category: '海鲜', calories: 56, protein: 7.6, carbs: 2.2, fat: 1.0, sodium: 400, fiber: 0, saturatedFat: 0.2, sugar: 0, isBuiltin: true },
  { id: 'seafood_squid', name: '鱿鱼', category: '海鲜', calories: 92, protein: 17.4, carbs: 0, fat: 1.9, sodium: 230, fiber: 0, saturatedFat: 0.3, sugar: 0, isBuiltin: true },
  { id: 'seafood_crab', name: '螃蟹', category: '海鲜', calories: 95, protein: 13.8, carbs: 2.3, fat: 2.3, sodium: 260, fiber: 0, saturatedFat: 0.3, sugar: 0, isBuiltin: true },
  // 豆制品 (6)
  { id: 'tofu_soft', name: '嫩豆腐', category: '豆制品', calories: 62, protein: 6.2, carbs: 1.8, fat: 3.3, sodium: 7, fiber: 0.2, saturatedFat: 0.5, sugar: 0.3, isBuiltin: true },
  { id: 'tofu_firm', name: '老豆腐', category: '豆制品', calories: 81, protein: 8.1, carbs: 3.8, fat: 3.7, sodium: 8, fiber: 0.4, saturatedFat: 0.6, sugar: 0.5, isBuiltin: true },
  { id: 'tofu_dried', name: '豆干', category: '豆制品', calories: 140, protein: 16.2, carbs: 3.8, fat: 7.0, sodium: 120, fiber: 0.5, saturatedFat: 1.0, sugar: 0.6, isBuiltin: true },
  { id: 'tofu_stick', name: '腐竹', category: '豆制品', calories: 459, protein: 44.6, carbs: 21.3, fat: 21.7, sodium: 28, fiber: 1.0, saturatedFat: 3.5, sugar: 2.0, isBuiltin: true },
  { id: 'tofu_skin', name: '豆腐皮', category: '豆制品', calories: 409, protein: 44.6, carbs: 18.6, fat: 17.4, sodium: 10, fiber: 1.2, saturatedFat: 2.8, sugar: 1.8, isBuiltin: true },
  { id: 'soy_edamame', name: '毛豆', category: '豆制品', calories: 131, protein: 13.1, carbs: 10.5, fat: 5.0, sodium: 4, fiber: 2.5, saturatedFat: 0.7, sugar: 1.0, isBuiltin: true },
  // 主食 (10)
  { id: 'staple_rice_raw', name: '大米(生)', category: '主食', calories: 346, protein: 7.4, carbs: 77.2, fat: 0.8, sodium: 4, fiber: 0.7, saturatedFat: 0.2, sugar: 0.1, isBuiltin: true },
  { id: 'staple_rice_cooked', name: '米饭(熟)', category: '主食', calories: 116, protein: 2.6, carbs: 25.6, fat: 0.3, sodium: 1, fiber: 0.3, saturatedFat: 0.1, sugar: 0.0, isBuiltin: true },
  { id: 'staple_noodle_raw', name: '面条(生)', category: '主食', calories: 284, protein: 8.5, carbs: 59.7, fat: 0.9, sodium: 6, fiber: 0.8, saturatedFat: 0.1, sugar: 0.2, isBuiltin: true },
  { id: 'staple_flour', name: '面粉', category: '主食', calories: 366, protein: 10.3, carbs: 73.5, fat: 1.5, sodium: 3, fiber: 2.7, saturatedFat: 0.2, sugar: 0.3, isBuiltin: true },
  { id: 'staple_bun', name: '馒头', category: '主食', calories: 223, protein: 7.0, carbs: 44.2, fat: 1.1, sodium: 5, fiber: 1.3, saturatedFat: 0.2, sugar: 0.5, isBuiltin: true },
  { id: 'staple_millet', name: '小米', category: '主食', calories: 358, protein: 9.0, carbs: 73.5, fat: 3.1, sodium: 4, fiber: 1.6, saturatedFat: 0.5, sugar: 0.8, isBuiltin: true },
  { id: 'staple_corn', name: '玉米', category: '主食', calories: 112, protein: 4.0, carbs: 22.8, fat: 1.2, sodium: 15, fiber: 2.9, saturatedFat: 0.2, sugar: 3.2, isBuiltin: true },
  { id: 'staple_sweet_potato', name: '红薯', category: '主食', calories: 86, protein: 1.6, carbs: 20.1, fat: 0.1, sodium: 55, fiber: 3.0, saturatedFat: 0.0, sugar: 4.2, isBuiltin: true },
  { id: 'staple_oats', name: '燕麦', category: '主食', calories: 377, protein: 13.5, carbs: 66.3, fat: 6.7, sodium: 4, fiber: 10.6, saturatedFat: 1.2, sugar: 0.7, isBuiltin: true },
  { id: 'staple_bread', name: '面包', category: '主食', calories: 266, protein: 8.8, carbs: 49.4, fat: 3.4, sodium: 250, fiber: 2.3, saturatedFat: 0.8, sugar: 4.5, isBuiltin: true },
  // 蛋奶 (6)
  { id: 'dairy_egg', name: '鸡蛋', category: '蛋奶', calories: 144, protein: 13.3, carbs: 2.8, fat: 8.8, sodium: 142, fiber: 0, saturatedFat: 2.5, sugar: 0.8, isBuiltin: true },
  { id: 'dairy_duck_egg', name: '鸭蛋', category: '蛋奶', calories: 180, protein: 12.6, carbs: 3.1, fat: 13.0, sodium: 146, fiber: 0, saturatedFat: 3.8, sugar: 0.9, isBuiltin: true },
  { id: 'dairy_century_egg', name: '皮蛋', category: '蛋奶', calories: 171, protein: 14.2, carbs: 1.0, fat: 12.0, sodium: 450, fiber: 0, saturatedFat: 3.5, sugar: 0.3, isBuiltin: true },
  { id: 'dairy_milk', name: '牛奶', category: '蛋奶', calories: 65, protein: 3.0, carbs: 5.0, fat: 3.6, sodium: 44, fiber: 0, saturatedFat: 2.2, sugar: 5.0, isBuiltin: true },
  { id: 'dairy_yogurt', name: '酸奶', category: '蛋奶', calories: 72, protein: 2.5, carbs: 9.3, fat: 2.7, sodium: 50, fiber: 0, saturatedFat: 1.7, sugar: 9.3, isBuiltin: true },
  { id: 'dairy_cheese', name: '奶酪', category: '蛋奶', calories: 328, protein: 25.7, carbs: 3.5, fat: 23.5, sodium: 620, fiber: 0, saturatedFat: 15.0, sugar: 0.5, isBuiltin: true },
  // 调味品 (12)
  { id: 'season_oil', name: '食用油', category: '调味品', calories: 899, protein: 0, carbs: 0, fat: 99.9, sodium: 0, fiber: 0, saturatedFat: 15.0, sugar: 0, isBuiltin: true },
  { id: 'season_salt', name: '盐', category: '调味品', calories: 0, protein: 0, carbs: 0, fat: 0, sodium: 39300, fiber: 0, saturatedFat: 0, sugar: 0, isBuiltin: true },
  { id: 'season_sugar', name: '白糖', category: '调味品', calories: 400, protein: 0, carbs: 100, fat: 0, sodium: 1, fiber: 0, saturatedFat: 0, sugar: 100, isBuiltin: true },
  { id: 'season_soy_sauce', name: '酱油', category: '调味品', calories: 53, protein: 5.6, carbs: 5.4, fat: 0.1, sodium: 6000, fiber: 0, saturatedFat: 0, sugar: 1.2, isBuiltin: true },
  { id: 'season_vinegar', name: '醋', category: '调味品', calories: 31, protein: 0.4, carbs: 5.6, fat: 0, sodium: 260, fiber: 0, saturatedFat: 0, sugar: 1.5, isBuiltin: true },
  { id: 'season_oyster_sauce', name: '蚝油', category: '调味品', calories: 100, protein: 1.5, carbs: 22.0, fat: 0.5, sodium: 3800, fiber: 0, saturatedFat: 0.1, sugar: 15.0, isBuiltin: true },
  { id: 'season_douban', name: '豆瓣酱', category: '调味品', calories: 133, protein: 7.0, carbs: 14.0, fat: 5.5, sodium: 4500, fiber: 1.5, saturatedFat: 0.8, sugar: 2.0, isBuiltin: true },
  { id: 'season_cooking_wine', name: '料酒', category: '调味品', calories: 37, protein: 0.3, carbs: 7.5, fat: 0, sodium: 5, fiber: 0, saturatedFat: 0, sugar: 0.5, isBuiltin: true },
  { id: 'season_light_soy', name: '生抽', category: '调味品', calories: 27, protein: 3.5, carbs: 2.4, fat: 0.1, sodium: 6500, fiber: 0, saturatedFat: 0, sugar: 0.8, isBuiltin: true },
  { id: 'season_dark_soy', name: '老抽', category: '调味品', calories: 80, protein: 2.0, carbs: 18.0, fat: 0, sodium: 5500, fiber: 0, saturatedFat: 0, sugar: 12.0, isBuiltin: true },
  { id: 'season_sesame_oil', name: '香油', category: '调味品', calories: 898, protein: 0, carbs: 0.2, fat: 99.7, sodium: 1, fiber: 0, saturatedFat: 14.0, sugar: 0, isBuiltin: true },
  { id: 'season_sichuan_pepper', name: '花椒', category: '调味品', calories: 258, protein: 6.7, carbs: 37.6, fat: 8.9, sodium: 47, fiber: 28.0, saturatedFat: 1.5, sugar: 0.5, isBuiltin: true },
  // 干货 (6)
  { id: 'dry_peanut', name: '花生米', category: '干货', calories: 563, protein: 24.8, carbs: 16.1, fat: 44.3, sodium: 18, fiber: 8.5, saturatedFat: 6.8, sugar: 4.0, isBuiltin: true },
  { id: 'dry_goji', name: '枸杞', category: '干货', calories: 258, protein: 14.3, carbs: 46.4, fat: 1.5, sodium: 298, fiber: 16.0, saturatedFat: 0.2, sugar: 45.0, isBuiltin: true },
  { id: 'dry_jujube', name: '红枣', category: '干货', calories: 264, protein: 3.2, carbs: 60.7, fat: 0.5, sodium: 6, fiber: 6.2, saturatedFat: 0.1, sugar: 56.0, isBuiltin: true },
  { id: 'dry_laver', name: '紫菜', category: '干货', calories: 207, protein: 28.9, carbs: 22.5, fat: 1.2, sodium: 710, fiber: 21.6, saturatedFat: 0.2, sugar: 0.5, isBuiltin: true },
  { id: 'dry_dried_shrimp', name: '虾皮', category: '干货', calories: 153, protein: 30.8, carbs: 2.5, fat: 2.2, sodium: 5100, fiber: 0, saturatedFat: 0.5, sugar: 0, isBuiltin: true },
  { id: 'dry_shiitake', name: '香菇(干)', category: '干货', calories: 274, protein: 20.2, carbs: 30.8, fat: 4.8, sodium: 12, fiber: 31.6, saturatedFat: 0.7, sugar: 2.0, isBuiltin: true },
  // 水果 (3)
  { id: 'fruit_lemon', name: '柠檬', category: '水果', calories: 29, protein: 1.1, carbs: 6.5, fat: 0.3, sodium: 2, fiber: 2.8, saturatedFat: 0.0, sugar: 2.5, isBuiltin: true },
  { id: 'fruit_apple', name: '苹果', category: '水果', calories: 52, protein: 0.2, carbs: 13.8, fat: 0.2, sodium: 1, fiber: 2.4, saturatedFat: 0.0, sugar: 10.4, isBuiltin: true },
  { id: 'fruit_pineapple', name: '菠萝', category: '水果', calories: 41, protein: 0.5, carbs: 10.0, fat: 0.1, sodium: 1, fiber: 1.4, saturatedFat: 0.0, sugar: 9.0, isBuiltin: true }
];

// ============ 预设菜品库 (40+ dishes with ingredient refs) ============
// Format: { id, name, category, cookingMethodId, calories, protein, carbs, fat, ingredients: [{ingredientId, amountG}], isBuiltin }
function buildPresetDishes() {
  return [
    // ---- 家常菜 ----
    { id: 'p1', name: '西红柿炒鸡蛋', category: '家常菜', cookingMethodId: 'cm_stir_fry', calories: 200, protein: 9.5, carbs: 12.0, fat: 12.5, sodium: 400, fiber: 1.2, saturatedFat: 3.0, sugar: 8.0, isBuiltin: true, ingredients: [{ id: 'dairy_egg', g: 150 }, { id: 'veg_tomato', g: 300 }, { id: 'season_oil', g: 10 }, { id: 'season_salt', g: 3 }, { id: 'season_sugar', g: 5 }] },
    { id: 'p2', name: '宫保鸡丁', category: '家常菜', cookingMethodId: 'cm_stir_fry', calories: 330, protein: 28.0, carbs: 16.5, fat: 18.0, sodium: 800, fiber: 2.5, saturatedFat: 3.0, sugar: 6.0, isBuiltin: true, ingredients: [{ id: 'meat_chicken_breast', g: 200 }, { id: 'dry_peanut', g: 30 }, { id: 'veg_cucumber', g: 100 }, { id: 'veg_carrot', g: 50 }, { id: 'season_oil', g: 15 }, { id: 'season_soy_sauce', g: 10 }, { id: 'season_vinegar', g: 5 }, { id: 'season_sugar', g: 5 }] },
    { id: 'p3', name: '红烧肉', category: '家常菜', cookingMethodId: 'cm_braise', calories: 490, protein: 19.0, carbs: 10.5, fat: 41.0, sodium: 1200, fiber: 0, saturatedFat: 16.0, sugar: 8.0, isBuiltin: true, ingredients: [{ id: 'meat_pork_belly', g: 300 }, { id: 'season_soy_sauce', g: 15 }, { id: 'season_dark_soy', g: 5 }, { id: 'season_sugar', g: 15 }, { id: 'season_cooking_wine', g: 10 }] },
    { id: 'p4', name: '清炒时蔬', category: '家常菜', cookingMethodId: 'cm_stir_fry', calories: 90, protein: 3.5, carbs: 8.5, fat: 5.0, sodium: 250, fiber: 3.5, saturatedFat: 0.5, sugar: 3.0, isBuiltin: true, ingredients: [{ id: 'veg_broccoli', g: 200 }, { id: 'veg_carrot', g: 100 }, { id: 'season_oil', g: 8 }, { id: 'season_salt', g: 3 }] },
    { id: 'p5', name: '麻婆豆腐', category: '家常菜', cookingMethodId: 'cm_stir_fry', calories: 240, protein: 16.0, carbs: 10.0, fat: 15.0, sodium: 1400, fiber: 1.5, saturatedFat: 2.5, sugar: 1.5, isBuiltin: true, ingredients: [{ id: 'tofu_soft', g: 400 }, { id: 'meat_pork_lean', g: 80 }, { id: 'season_douban', g: 15 }, { id: 'season_oil', g: 10 }, { id: 'season_soy_sauce', g: 8 }] },
    { id: 'p6', name: '糖醋里脊', category: '家常菜', cookingMethodId: 'cm_deep_fry', calories: 370, protein: 24.0, carbs: 32.0, fat: 17.0, sodium: 500, fiber: 0.5, saturatedFat: 3.5, sugar: 18.0, isBuiltin: true, ingredients: [{ id: 'meat_pork_lean', g: 200 }, { id: 'season_sugar', g: 20 }, { id: 'season_vinegar', g: 10 }, { id: 'dairy_egg', g: 50 }, { id: 'staple_flour', g: 30 }, { id: 'season_oil', g: 25 }] },
    { id: 'p7', name: '鱼香肉丝', category: '家常菜', cookingMethodId: 'cm_stir_fry', calories: 300, protein: 20.0, carbs: 18.0, fat: 16.5, sodium: 1100, fiber: 2.0, saturatedFat: 3.0, sugar: 8.0, isBuiltin: true, ingredients: [{ id: 'meat_pork_lean', g: 150 }, { id: 'veg_wood_ear', g: 10 }, { id: 'veg_carrot', g: 80 }, { id: 'veg_green_pepper', g: 80 }, { id: 'season_douban', g: 10 }, { id: 'season_oil', g: 12 }, { id: 'season_soy_sauce', g: 8 }, { id: 'season_vinegar', g: 8 }, { id: 'season_sugar', g: 8 }] },
    { id: 'p8', name: '回锅肉', category: '家常菜', cookingMethodId: 'cm_stir_fry', calories: 390, protein: 22.0, carbs: 8.0, fat: 31.0, sodium: 1300, fiber: 1.0, saturatedFat: 12.0, sugar: 3.0, isBuiltin: true, ingredients: [{ id: 'meat_pork_belly', g: 250 }, { id: 'veg_garlic_sprout', g: 100 }, { id: 'season_douban', g: 15 }, { id: 'season_soy_sauce', g: 8 }, { id: 'season_oil', g: 10 }] },
    { id: 'p9', name: '干煸四季豆', category: '家常菜', cookingMethodId: 'cm_stir_fry', calories: 180, protein: 7.5, carbs: 16.0, fat: 10.5, sodium: 700, fiber: 4.0, saturatedFat: 1.5, sugar: 3.5, isBuiltin: true, ingredients: [{ id: 'veg_green_beans', g: 250 }, { id: 'meat_pork_lean', g: 50 }, { id: 'season_oil', g: 20 }, { id: 'season_soy_sauce', g: 8 }, { id: 'season_salt', g: 3 }] },
    { id: 'p10', name: '可乐鸡翅', category: '家常菜', cookingMethodId: 'cm_braise', calories: 330, protein: 24.0, carbs: 20.0, fat: 17.0, sodium: 900, fiber: 0, saturatedFat: 4.5, sugar: 12.0, isBuiltin: true, ingredients: [{ id: 'meat_chicken_wing', g: 400 }, { id: 'season_soy_sauce', g: 10 }, { id: 'season_cooking_wine', g: 8 }, { id: 'season_oil', g: 8 }, { id: 'season_sugar', g: 10 }] },
    { id: 'p11', name: '蒜蓉西兰花', category: '家常菜', cookingMethodId: 'cm_stir_fry', calories: 100, protein: 6.0, carbs: 9.5, fat: 5.0, sodium: 500, fiber: 5.0, saturatedFat: 0.5, sugar: 3.0, isBuiltin: true, ingredients: [{ id: 'veg_broccoli', g: 350 }, { id: 'season_oil', g: 8 }, { id: 'season_salt', g: 3 }, { id: 'season_oyster_sauce', g: 5 }] },
    { id: 'p12', name: '蛋炒饭', category: '主食', cookingMethodId: 'cm_stir_fry', calories: 400, protein: 13.5, carbs: 50.0, fat: 15.5, sodium: 500, fiber: 1.5, saturatedFat: 3.0, sugar: 1.5, isBuiltin: true, ingredients: [{ id: 'staple_rice_cooked', g: 300 }, { id: 'dairy_egg', g: 100 }, { id: 'veg_carrot', g: 30 }, { id: 'veg_green_pepper', g: 30 }, { id: 'season_oil', g: 10 }, { id: 'season_salt', g: 3 }] },
    { id: 'p13', name: '番茄牛腩', category: '家常菜', cookingMethodId: 'cm_stew', calories: 380, protein: 30.0, carbs: 18.0, fat: 21.0, sodium: 600, fiber: 2.0, saturatedFat: 6.0, sugar: 8.0, isBuiltin: true, ingredients: [{ id: 'meat_beef_brisket', g: 300 }, { id: 'veg_tomato', g: 400 }, { id: 'veg_onion', g: 100 }, { id: 'season_oil', g: 12 }, { id: 'season_salt', g: 5 }] },
    { id: 'p14', name: '酸辣土豆丝', category: '家常菜', cookingMethodId: 'cm_stir_fry', calories: 140, protein: 3.5, carbs: 24.0, fat: 4.5, sodium: 400, fiber: 3.5, saturatedFat: 0.5, sugar: 2.0, isBuiltin: true, ingredients: [{ id: 'veg_potato', g: 300 }, { id: 'season_vinegar', g: 10 }, { id: 'season_oil', g: 8 }, { id: 'season_salt', g: 3 }, { id: 'season_sichuan_pepper', g: 2 }] },
    { id: 'p15', name: '清蒸鱼', category: '家常菜', cookingMethodId: 'cm_steam', calories: 190, protein: 27.0, carbs: 2.0, fat: 8.5, sodium: 900, fiber: 0, saturatedFat: 2.0, sugar: 1.0, isBuiltin: true, ingredients: [{ id: 'seafood_bass', g: 500 }, { id: 'season_light_soy', g: 15 }, { id: 'season_oil', g: 8 }, { id: 'season_cooking_wine', g: 10 }] },
    { id: 'p16', name: '木须肉', category: '家常菜', cookingMethodId: 'cm_stir_fry', calories: 270, protein: 18.0, carbs: 10.0, fat: 17.0, sodium: 700, fiber: 1.5, saturatedFat: 3.5, sugar: 2.5, isBuiltin: true, ingredients: [{ id: 'meat_pork_lean', g: 120 }, { id: 'dairy_egg', g: 100 }, { id: 'veg_wood_ear', g: 10 }, { id: 'veg_cucumber', g: 100 }, { id: 'season_oil', g: 12 }, { id: 'season_soy_sauce', g: 8 }, { id: 'season_salt', g: 3 }] },
    { id: 'p17', name: '地三鲜', category: '家常菜', cookingMethodId: 'cm_stir_fry', calories: 260, protein: 6.0, carbs: 30.0, fat: 14.0, sodium: 800, fiber: 4.0, saturatedFat: 1.5, sugar: 5.0, isBuiltin: true, ingredients: [{ id: 'veg_potato', g: 150 }, { id: 'veg_eggplant', g: 150 }, { id: 'veg_green_pepper', g: 100 }, { id: 'season_oil', g: 20 }, { id: 'season_soy_sauce', g: 10 }, { id: 'season_sugar', g: 3 }, { id: 'season_salt', g: 3 }] },
    { id: 'p18', name: '紫菜蛋花汤', category: '汤类', cookingMethodId: 'cm_boil', calories: 70, protein: 5.5, carbs: 4.0, fat: 3.5, sodium: 800, fiber: 1.0, saturatedFat: 1.0, sugar: 0.5, isBuiltin: true, ingredients: [{ id: 'dry_laver', g: 5 }, { id: 'dairy_egg', g: 50 }, { id: 'dry_dried_shrimp', g: 5 }, { id: 'season_salt', g: 2 }, { id: 'season_sesame_oil', g: 2 }] },
    { id: 'p19', name: '牛肉面', category: '主食', cookingMethodId: 'cm_boil', calories: 500, protein: 28.0, carbs: 58.0, fat: 18.0, sodium: 1500, fiber: 2.0, saturatedFat: 4.0, sugar: 3.0, isBuiltin: true, ingredients: [{ id: 'staple_noodle_raw', g: 200 }, { id: 'meat_beef_brisket', g: 150 }, { id: 'season_soy_sauce', g: 10 }, { id: 'season_douban', g: 10 }, { id: 'season_oil', g: 8 }] },
    { id: 'p20', name: '小米粥', category: '早餐', cookingMethodId: 'cm_boil', calories: 110, protein: 3.5, carbs: 22.0, fat: 1.5, sodium: 2, fiber: 1.0, saturatedFat: 0.3, sugar: 0.5, isBuiltin: true, ingredients: [{ id: 'staple_millet', g: 50 }] },
    { id: 'p21', name: '煮鸡蛋', category: '早餐', cookingMethodId: 'cm_boil', calories: 85, protein: 7.0, carbs: 1.0, fat: 6.0, sodium: 130, fiber: 0, saturatedFat: 2.0, sugar: 0.5, isBuiltin: true, ingredients: [{ id: 'dairy_egg', g: 100 }] },
    { id: 'p22', name: '皮蛋豆腐', category: '凉菜', cookingMethodId: 'cm_cold', calories: 145, protein: 10.5, carbs: 4.0, fat: 9.5, sodium: 800, fiber: 0.5, saturatedFat: 3.0, sugar: 1.0, isBuiltin: true, ingredients: [{ id: 'tofu_soft', g: 300 }, { id: 'dairy_century_egg', g: 120 }, { id: 'season_light_soy', g: 8 }, { id: 'season_sesame_oil', g: 3 }] },
    { id: 'p23', name: '蔬菜沙拉', category: '凉菜', cookingMethodId: 'cm_cold', calories: 130, protein: 4.0, carbs: 9.5, fat: 8.5, sodium: 50, fiber: 3.5, saturatedFat: 1.0, sugar: 5.0, isBuiltin: true, ingredients: [{ id: 'veg_lettuce', g: 150 }, { id: 'veg_tomato', g: 100 }, { id: 'veg_cucumber', g: 100 }, { id: 'staple_corn', g: 50 }] },
    { id: 'p24', name: '豆浆', category: '早餐', cookingMethodId: 'cm_boil', calories: 90, protein: 6.5, carbs: 4.5, fat: 5.0, sodium: 5, fiber: 1.0, saturatedFat: 0.5, sugar: 10.0, isBuiltin: true, ingredients: [{ id: 'soy_edamame', g: 60 }, { id: 'season_sugar', g: 10 }] },
    // ---- 粤菜 (8道) ----
    { id: 'p25', name: '白切鸡', category: '粤菜', cookingMethodId: 'cm_boil', calories: 280, protein: 32.0, carbs: 1.0, fat: 16.0, sodium: 800, fiber: 0, saturatedFat: 4.0, sugar: 0.5, isBuiltin: true, ingredients: [{ id: 'meat_chicken_thigh', g: 300 }, { id: 'season_light_soy', g: 10 }, { id: 'season_sesame_oil', g: 5 }, { id: 'season_cooking_wine', g: 8 }] },
    { id: 'p26', name: '叉烧肉', category: '粤菜', cookingMethodId: 'cm_roast', calories: 350, protein: 28.0, carbs: 20.0, fat: 18.0, sodium: 1100, fiber: 0, saturatedFat: 5.0, sugar: 16.0, isBuiltin: true, ingredients: [{ id: 'meat_pork_lean', g: 300 }, { id: 'season_sugar', g: 20 }, { id: 'season_soy_sauce', g: 15 }, { id: 'season_oyster_sauce', g: 10 }, { id: 'season_cooking_wine', g: 8 }] },
    { id: 'p27', name: '咕噜肉', category: '粤菜', cookingMethodId: 'cm_deep_fry', calories: 400, protein: 22.0, carbs: 35.0, fat: 20.0, sodium: 600, fiber: 1.5, saturatedFat: 4.0, sugar: 18.0, isBuiltin: true, ingredients: [{ id: 'meat_pork_lean', g: 200 }, { id: 'veg_green_pepper', g: 80 }, { id: 'fruit_pineapple', g: 80 }, { id: 'season_sugar', g: 15 }, { id: 'season_vinegar', g: 10 }, { id: 'season_oil', g: 25 }, { id: 'staple_flour', g: 30 }] },
    { id: 'p28', name: '蚝油生菜', category: '粤菜', cookingMethodId: 'cm_stir_fry', calories: 80, protein: 3.0, carbs: 7.0, fat: 4.5, sodium: 700, fiber: 2.0, saturatedFat: 0.5, sugar: 3.0, isBuiltin: true, ingredients: [{ id: 'veg_lettuce', g: 300 }, { id: 'season_oyster_sauce', g: 15 }, { id: 'season_oil', g: 5 }, { id: 'season_salt', g: 2 }] },
    { id: 'p29', name: '豉汁蒸排骨', category: '粤菜', cookingMethodId: 'cm_steam', calories: 320, protein: 25.0, carbs: 8.0, fat: 21.0, sodium: 900, fiber: 0, saturatedFat: 7.0, sugar: 3.0, isBuiltin: true, ingredients: [{ id: 'meat_pork_rib', g: 300 }, { id: 'season_soy_sauce', g: 10 }, { id: 'season_cooking_wine', g: 8 }, { id: 'season_sugar', g: 5 }, { id: 'season_oil', g: 8 }] },
    { id: 'p30', name: '干炒牛河', category: '粤菜', cookingMethodId: 'cm_stir_fry', calories: 480, protein: 24.0, carbs: 55.0, fat: 18.0, sodium: 1000, fiber: 2.0, saturatedFat: 3.0, sugar: 3.0, isBuiltin: true, ingredients: [{ id: 'staple_rice_cooked', g: 300 }, { id: 'meat_beef_lean', g: 150 }, { id: 'veg_bean_sprout', g: 100 }, { id: 'veg_onion', g: 50 }, { id: 'season_oil', g: 15 }, { id: 'season_soy_sauce', g: 10 }] },
    { id: 'p31', name: '煲仔饭', category: '粤菜', cookingMethodId: 'cm_braise', calories: 550, protein: 26.0, carbs: 65.0, fat: 20.0, sodium: 1100, fiber: 1.0, saturatedFat: 6.0, sugar: 3.0, isBuiltin: true, ingredients: [{ id: 'staple_rice_raw', g: 150 }, { id: 'meat_chicken_thigh', g: 150 }, { id: 'meat_pork_belly', g: 80 }, { id: 'season_soy_sauce', g: 10 }, { id: 'season_dark_soy', g: 5 }, { id: 'season_oil', g: 8 }] },
    { id: 'p32', name: '虾饺', category: '粤菜', cookingMethodId: 'cm_steam', calories: 200, protein: 14.0, carbs: 22.0, fat: 6.0, sodium: 350, fiber: 1.0, saturatedFat: 1.5, sugar: 0.5, isBuiltin: true, ingredients: [{ id: 'seafood_shrimp', g: 150 }, { id: 'staple_flour', g: 100 }, { id: 'meat_pork_lean', g: 50 }, { id: 'season_salt', g: 3 }, { id: 'season_sesame_oil', g: 3 }] },
    // ---- 川湘辣菜 (8道) ----
    { id: 'p33', name: '水煮牛肉', category: '川湘辣菜', cookingMethodId: 'cm_boil', calories: 350, protein: 28.0, carbs: 8.0, fat: 23.0, sodium: 1800, fiber: 2.5, saturatedFat: 6.0, sugar: 2.0, isBuiltin: true, ingredients: [{ id: 'meat_beef_slice', g: 250 }, { id: 'veg_bean_sprout', g: 150 }, { id: 'veg_lettuce', g: 100 }, { id: 'season_douban', g: 20 }, { id: 'season_oil', g: 20 }, { id: 'season_sichuan_pepper', g: 5 }] },
    { id: 'p34', name: '辣子鸡', category: '川湘辣菜', cookingMethodId: 'cm_deep_fry', calories: 380, protein: 26.0, carbs: 10.0, fat: 26.0, sodium: 700, fiber: 2.0, saturatedFat: 5.0, sugar: 2.0, isBuiltin: true, ingredients: [{ id: 'meat_chicken_thigh', g: 300 }, { id: 'dry_peanut', g: 40 }, { id: 'season_oil', g: 30 }, { id: 'season_sichuan_pepper', g: 5 }, { id: 'season_salt', g: 3 }] },
    { id: 'p35', name: '口水鸡', category: '川湘辣菜', cookingMethodId: 'cm_cold', calories: 310, protein: 28.0, carbs: 5.0, fat: 20.0, sodium: 1300, fiber: 0.5, saturatedFat: 4.0, sugar: 2.0, isBuiltin: true, ingredients: [{ id: 'meat_chicken_thigh', g: 300 }, { id: 'season_douban', g: 15 }, { id: 'season_sesame_oil', g: 5 }, { id: 'season_light_soy', g: 8 }, { id: 'season_sichuan_pepper', g: 3 }] },
    { id: 'p36', name: '剁椒鱼头', category: '川湘辣菜', cookingMethodId: 'cm_steam', calories: 280, protein: 28.0, carbs: 6.0, fat: 16.0, sodium: 1100, fiber: 0, saturatedFat: 2.5, sugar: 1.0, isBuiltin: true, ingredients: [{ id: 'seafood_carp', g: 500 }, { id: 'season_oil', g: 15 }, { id: 'season_light_soy', g: 10 }, { id: 'season_cooking_wine', g: 10 }, { id: 'season_salt', g: 3 }] },
    { id: 'p37', name: '农家小炒肉', category: '川湘辣菜', cookingMethodId: 'cm_stir_fry', calories: 320, protein: 22.0, carbs: 10.0, fat: 21.0, sodium: 1000, fiber: 2.0, saturatedFat: 8.0, sugar: 3.0, isBuiltin: true, ingredients: [{ id: 'meat_pork_belly', g: 200 }, { id: 'veg_green_pepper', g: 150 }, { id: 'veg_onion', g: 80 }, { id: 'season_oil', g: 12 }, { id: 'season_soy_sauce', g: 10 }] },
    { id: 'p38', name: '毛血旺', category: '川湘辣菜', cookingMethodId: 'cm_boil', calories: 420, protein: 30.0, carbs: 8.0, fat: 30.0, sodium: 2000, fiber: 2.0, saturatedFat: 9.0, sugar: 1.5, isBuiltin: true, ingredients: [{ id: 'meat_beef_slice', g: 150 }, { id: 'meat_pork_belly', g: 100 }, { id: 'veg_bean_sprout', g: 150 }, { id: 'tofu_skin', g: 50 }, { id: 'season_douban', g: 20 }, { id: 'season_oil', g: 25 }] },
    { id: 'p39', name: '酸菜鱼', category: '川湘辣菜', cookingMethodId: 'cm_boil', calories: 290, protein: 26.0, carbs: 4.0, fat: 18.0, sodium: 1200, fiber: 0.5, saturatedFat: 3.0, sugar: 1.0, isBuiltin: true, ingredients: [{ id: 'seafood_carp', g: 400 }, { id: 'veg_napa', g: 100 }, { id: 'season_vinegar', g: 10 }, { id: 'season_oil', g: 15 }, { id: 'season_salt', g: 5 }, { id: 'season_sichuan_pepper', g: 3 }] },
    { id: 'p40', name: '香辣虾', category: '川湘辣菜', cookingMethodId: 'cm_stir_fry', calories: 250, protein: 28.0, carbs: 8.0, fat: 12.0, sodium: 900, fiber: 0.5, saturatedFat: 2.0, sugar: 4.0, isBuiltin: true, ingredients: [{ id: 'seafood_shrimp', g: 300 }, { id: 'season_oil', g: 15 }, { id: 'season_soy_sauce', g: 8 }, { id: 'season_sugar', g: 5 }, { id: 'season_sichuan_pepper', g: 3 }] },
    // ---- 其他新增 (4道) ----
    { id: 'p41', name: '葱爆羊肉', category: '家常菜', cookingMethodId: 'cm_stir_fry', calories: 350, protein: 24.0, carbs: 10.0, fat: 24.0, sodium: 700, fiber: 1.5, saturatedFat: 6.0, sugar: 3.0, isBuiltin: true, ingredients: [{ id: 'meat_lamb', g: 250 }, { id: 'veg_onion', g: 150 }, { id: 'season_oil', g: 12 }, { id: 'season_soy_sauce', g: 8 }, { id: 'season_cooking_wine', g: 8 }] },
    { id: 'p42', name: '京酱肉丝', category: '家常菜', cookingMethodId: 'cm_stir_fry', calories: 340, protein: 26.0, carbs: 18.0, fat: 17.0, sodium: 900, fiber: 1.0, saturatedFat: 3.5, sugar: 6.0, isBuiltin: true, ingredients: [{ id: 'meat_pork_lean', g: 200 }, { id: 'tofu_skin', g: 100 }, { id: 'veg_cucumber', g: 80 }, { id: 'season_soy_sauce', g: 10 }, { id: 'season_sugar', g: 8 }, { id: 'season_oil', g: 10 }] },
    { id: 'p43', name: '松鼠桂鱼', category: '家常菜', cookingMethodId: 'cm_deep_fry', calories: 420, protein: 24.0, carbs: 34.0, fat: 21.0, sodium: 600, fiber: 1.0, saturatedFat: 3.5, sugar: 16.0, isBuiltin: true, ingredients: [{ id: 'seafood_carp', g: 400 }, { id: 'staple_flour', g: 30 }, { id: 'season_sugar', g: 20 }, { id: 'season_vinegar', g: 10 }, { id: 'season_oil', g: 30 }, { id: 'season_salt', g: 3 }] },
    { id: 'p44', name: '西湖牛肉羹', category: '汤类', cookingMethodId: 'cm_stew', calories: 180, protein: 18.0, carbs: 10.0, fat: 8.0, sodium: 500, fiber: 0.3, saturatedFat: 2.0, sugar: 1.0, isBuiltin: true, ingredients: [{ id: 'meat_beef_lean', g: 150 }, { id: 'tofu_soft', g: 150 }, { id: 'dairy_egg', g: 50 }, { id: 'season_salt', g: 3 }, { id: 'season_cooking_wine', g: 8 }] }
  ];
}

// ============ 应用状态 ============
let currentUser = null;
let users = [];
let currentWeekStart = getMonday(new Date());
let mealPlans = {};
let customDishes = [];
let customIngredients = [];
let shoppingChecked = {};

let actualMeals = {};
let exercisePlans = {};  // { weekStart: { days: { 0: { preset, calories }, ... } } }
let weightLogs = [];     // [{ date, weight }]
let activeNav = 'user';
let pickerCallback = null;

// ============ 热量单位 ============
let calorieUnit = 'kcal'; // 'kcal' | 'kj'  (1 kcal = 4.184 kJ)

function fmtKcal(kcal) {
  // 返回转换后的数值（整数）
  if (calorieUnit === 'kj') return Math.round(kcal * 4.184);
  return Math.round(kcal);
}

function calUnit() {
  return calorieUnit === 'kj' ? 'kJ' : 'kcal';
}

function fmtCal(kcal, showUnit = true) {
  // 返回格式化字符串 "500 kcal" 或 "2092 kJ"
  const val = fmtKcal(kcal);
  return showUnit ? `${val} ${calUnit()}` : String(val);
}

// ============ 计算引擎 ============

function calcBMR(user) {
  // 如果有体脂率，使用 Katch-McArdle 公式（基于瘦体重，更精确）
  if (user.bodyFat && user.bodyFat > 0) {
    const lbm = user.weight * (1 - user.bodyFat / 100);
    return 370 + 21.6 * lbm;
  }
  // 否则使用 Mifflin-St Jeor 公式
  if (user.gender === 'male') {
    return 10 * user.weight + 6.25 * user.height - 5 * user.age + 5;
  } else {
    return 10 * user.weight + 6.25 * user.height - 5 * user.age - 161;
  }
}

function calcTDEE(user) {
  const bmr = calcBMR(user);
  const dailyPAL = parseFloat(user.dailyPAL) || 1.4;
  const dailyExpenditure = Math.round(bmr * dailyPAL);
  const exerciseKcal = parseInt(user.exerciseKcal) || 0;
  return dailyExpenditure + exerciseKcal;
}

// 精细模式：计算某一天的TDEE（根据当日运动量）
function calcDayTDEE(user, dayExerciseKcal) {
  const bmr = calcBMR(user);
  const dailyPAL = parseFloat(user.dailyPAL) || 1.4;
  const dailyExpenditure = Math.round(bmr * dailyPAL);
  return dailyExpenditure + (dayExerciseKcal || 0);
}

// 获取某天的运动消耗
function getDayExerciseKcal(weekStart, dayIndex) {
  const plan = exercisePlans[weekStart];
  if (!plan || !plan.days || !plan.days[dayIndex]) return 0;
  return plan.days[dayIndex].calories || 0;
}

// 获取某天的运动预设信息
function getDayExerciseInfo(weekStart, dayIndex) {
  const plan = exercisePlans[weekStart];
  if (!plan || !plan.days || !plan.days[dayIndex]) return null;
  return plan.days[dayIndex];
}

// 设置某天的运动
function setDayExercise(weekStart, dayIndex, presetId, calories) {
  if (!exercisePlans[weekStart]) {
    exercisePlans[weekStart] = { days: {} };
  }
  exercisePlans[weekStart].days[dayIndex] = { preset: presetId, calories: calories || 0 };
  saveData();
}

// 获取某一天应使用的TDEE（根据模式自动选择粗糙或精细）
function getEffectiveDayTDEE(user, weekStart, dayIndex) {
  if (!user) return 2000;
  const mode = user.exerciseMode || 'rough';
  if (mode === 'fine') {
    const exKcal = getDayExerciseKcal(weekStart, dayIndex);
    return calcDayTDEE(user, exKcal);
  }
  return calcTDEE(user);
}

function calcTargetCalories(user, dayTDEE) {
  const tdee = dayTDEE || calcTDEE(user);
  if (user.targetHabit === 'maintain') return tdee;
  if (!user.targetDate) {
    // 没有目标日期时使用默认 ±500 kcal
    return user.targetHabit === 'lose' ? tdee - 500 : tdee + 500;
  }

  const weightDiff = Math.abs(user.weight - user.targetWeight);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDate = new Date(user.targetDate + 'T00:00:00');
  const days = Math.max(1, Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24)));
  const totalKcal = weightDiff * 7700; // 1kg ≈ 7700 kcal
  const dailyChange = Math.round(totalKcal / days);

  if (user.targetHabit === 'lose') {
    // 不低于 BMR 或 1200 kcal
    const minCal = Math.max(Math.round(calcBMR(user)), 1200);
    const target = tdee - dailyChange;
    return Math.max(minCal, target);
  } else {
    return tdee + dailyChange;
  }
}

// 检查减重/增重计划是否健康，返回 { healthy: bool, warning: string, rate: string }
function checkHealthWarning(user) {
  if (!user.targetDate || user.targetHabit === 'maintain') return { healthy: true };

  const weightDiff = Math.abs(user.weight - user.targetWeight);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDate = new Date(user.targetDate + 'T00:00:00');
  const days = Math.max(1, Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24)));
  const weeks = days / 7;
  const weeklyRate = weightDiff / weeks;
  const totalKcal = weightDiff * 7700;
  const dailyChange = Math.round(totalKcal / days);

  const warnings = [];

  // ---- 热量与速度检查 ----
  if (user.targetHabit === 'lose') {
    if (weeklyRate > 1.0) {
      warnings.push(`计划每周减重 <strong>${weeklyRate.toFixed(1)} kg</strong>，超过健康上限 <strong>1.0 kg/周</strong>`);
    }
    if (dailyChange > 1100) {
      warnings.push(`每日热量缺口 <strong>${fmtCal(dailyChange)}</strong>，超过安全上限 <strong>${fmtCal(1100)}/天</strong>`);
    }
    const tdee = calcTDEE(user);
    const target = tdee - dailyChange;
    const bmr = Math.round(calcBMR(user));
    if (target < Math.max(bmr, 1200)) {
      warnings.push(`目标摄入 <strong>${fmtCal(target)}</strong> 低于基础代谢 <strong>${fmtCal(bmr)}</strong>，可能导致代谢损伤`);
    }
  } else if (user.targetHabit === 'gain') {
    if (weeklyRate > 0.5) {
      warnings.push(`计划每周增重 <strong>${weeklyRate.toFixed(1)} kg</strong>，超过健康上限 <strong>0.5 kg/周</strong>（过快增重大部分为脂肪）`);
    }
    if (dailyChange > 550) {
      warnings.push(`每日热量盈余 <strong>${fmtCal(dailyChange)}</strong>，超过推荐上限 <strong>${fmtCal(550)}/天</strong>`);
    }
  }

  if (days < 7) {
    warnings.push(`目标期限仅 <strong>${days}</strong> 天，过于仓促，建议至少设置 4 周以上的目标`);
  }

  // ---- 宏量营养素最低可行性检查 ----
  // 宏量已自动适配 AMDR 范围，这里只检查总热量是否低到无法满足所有最低需求
  const macros = calcMacroTargets(user);
  const targetCal = calcTargetCalories(user);
  const minProteinKcal = Math.round(user.weight * 0.8) * 4;
  const minFatKcal = Math.round(user.weight * 0.8) * 9;
  const minCarbsKcal = 130 * 4;
  const absoluteMinKcal = minProteinKcal + minFatKcal + minCarbsKcal;

  if (targetCal < absoluteMinKcal && user.targetHabit === 'lose') {
    warnings.push(`目标热量 <strong>${fmtCal(targetCal)}</strong> 低于营养素最低需求 <strong>${fmtCal(absoluteMinKcal)}</strong>（蛋白质${Math.round(minProteinKcal/4)}g + 脂肪${Math.round(minFatKcal/9)}g + 碳水130g），建议延长目标期限或调整目标体重`);
  }

  if (warnings.length === 0) {
    const rateText = user.targetHabit === 'lose'
      ? `每周减重 ${weeklyRate.toFixed(1)} kg（健康范围 ≤1.0 kg/周）`
      : `每周增重 ${weeklyRate.toFixed(1)} kg（健康范围 ≤0.5 kg/周）`;
    return { healthy: true, rate: rateText };
  }

  return {
    healthy: false,
    warning: warnings.join('<br>'),
    rate: user.targetHabit === 'lose'
      ? `每周减重 ${weeklyRate.toFixed(1)} kg（建议 ≤1.0 kg/周）`
      : `每周增重 ${weeklyRate.toFixed(1)} kg（建议 ≤0.5 kg/周）`
  };
}

function renderTargetDateStats(user) {
  if (!user.targetDate || user.targetHabit === 'maintain') return '';
  const check = checkHealthWarning(user);
  const weightDiff = Math.abs(user.weight - user.targetWeight);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const targetDate = new Date(user.targetDate + 'T00:00:00');
  const days = Math.max(1, Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24)));
  const weeks = days / 7;
  const weeklyRate = weightDiff / weeks;
  const dailyChange = Math.round(weightDiff * 7700 / days);
  const statusIcon = check.healthy ? '✅' : '⚠️';
  const statusColor = check.healthy ? '#28a745' : '#dc3545';

  return `
    <h3 style="margin-top:16px;margin-bottom:10px;">${statusIcon} 目标达成计划</h3>
    <div class="user-stats-grid">
      <div class="user-stat-card" style="border-left:3px solid ${statusColor};">
        <div class="stat-value">${user.targetDate}</div>
        <div class="stat-label">目标达成日期</div>
      </div>
      <div class="user-stat-card" style="border-left:3px solid ${statusColor};">
        <div class="stat-value">${days} 天</div>
        <div class="stat-label">剩余时间（约 ${weeks.toFixed(1)} 周）</div>
      </div>
      <div class="user-stat-card" style="border-left:3px solid ${statusColor};">
        <div class="stat-value">${user.targetHabit === 'lose' ? '-' : '+'}${fmtKcal(dailyChange)} ${calUnit()}</div>
        <div class="stat-label">每日热量${user.targetHabit === 'lose' ? '缺口' : '盈余'}</div>
      </div>
      <div class="user-stat-card" style="border-left:3px solid ${statusColor};">
        <div class="stat-value">${weeklyRate.toFixed(1)} kg/周</div>
        <div class="stat-label">${user.targetHabit === 'lose' ? '减重' : '增重'}速度</div>
      </div>
    </div>
    <p style="font-size:12px;color:${statusColor};margin-top:4px;">
      ${check.healthy ? check.rate : check.warning}
    </p>`;
}

// 宏量营养素目标计算（自动适配到 AMDR 健康范围）
// 优先级: 蛋白质(肌肉保护) → 脂肪(激素健康) → 碳水(弹性填充)
// 减重: 2.0g/kg蛋白 | 维持: 1.6g/kg | 增重: 1.8g/kg
// 脂肪最低 0.8g/kg, 碳水最低 130g/天, AMDR 范围内自动平衡
function calcMacroTargets(user) {
  const targetCal = calcTargetCalories(user);
  const minProtein = Math.round(user.weight * 0.8);
  const minFat = Math.round(user.weight * 0.8);
  const minCarbs = 130; // 大脑基本葡萄糖需求
  const minCarbsKcal = minCarbs * 4;
  const minFatKcal = minFat * 9;

  // 1. 蛋白质目标（根据目标调整，优先保证肌肉）
  const proteinPerKg = user.targetHabit === 'lose' ? 2.0 : user.targetHabit === 'gain' ? 1.8 : 1.6;
  let protein = Math.round(user.weight * proteinPerKg);
  // 不能超过 3.0g/kg 或 35% 总热量
  const maxProtein = Math.min(Math.round(user.weight * 3.0), Math.floor(targetCal * 0.35 / 4));
  protein = Math.max(minProtein, Math.min(protein, maxProtein));
  const proteinKcal = protein * 4;

  // 2. 脂肪目标（保证激素健康，默认 25% 热量）
  const remainingAfterProtein = targetCal - proteinKcal;
  let fatKcal = Math.round(remainingAfterProtein * 0.28); // 脂肪占剩余热量的 28%
  // 不低于最低值，不超过 35% 总热量
  fatKcal = Math.max(minFatKcal, Math.min(fatKcal, Math.floor(targetCal * 0.35)));
  let fat = Math.round(fatKcal / 9);

  // 3. 碳水 = 剩余热量（弹性填充）
  let carbsKcal = targetCal - proteinKcal - fat * 9;
  let carbs = Math.round(carbsKcal / 4);

  // 4. 如果碳水低于最低值，减少脂肪腾出空间
  if (carbs < minCarbs && fat > minFat) {
    const needKcal = (minCarbs - carbs) * 4;
    const fatCanReduce = Math.max(0, (fat - minFat) * 9);
    const actualReduce = Math.min(needKcal, fatCanReduce);
    fat = Math.round((fat * 9 - actualReduce) / 9);
    carbsKcal = targetCal - proteinKcal - fat * 9;
    carbs = Math.round(carbsKcal / 4);
  }

  // 5. 极低热量时：等比缩减所有宏量，保证不低于最低值
  if (carbs < minCarbs) {
    // 总热量不足以满足所有最低需求，保持最低值（差额从碳水扣）
    protein = minProtein;
    fat = minFat;
    carbs = Math.round((targetCal - minProtein * 4 - minFat * 9) / 4);
    if (carbs < 0) carbs = 0; // 极端情况
  }

  // 6. 钠/纤维/饱和脂肪/糖目标（基于膳食指南）
  const sodium = 2000;           // WHO <2000mg/天
  const satFatMax = Math.round(targetCal * 0.10 / 9); // 饱和脂肪 <10% 总热量
  const sugarMax = 50;           // WHO <50g/天添加糖（理想<25g）
  const fiberTarget = user.gender === 'male' ? 30 : 25; // 膳食纤维 男30g 女25g

  return { protein, carbs, fat, sodium, fiber: fiberTarget, saturatedFat: satFatMax, sugar: sugarMax };
}

function getDayNutrition(weekStart, dayIndex) {
  return calcNutritionFromPlan(getMealPlan(weekStart), dayIndex);
}

function getActualDayNutrition(weekStart, dayIndex) {
  return calcNutritionFromPlan(getActualMealPlan(weekStart), dayIndex);
}

function calcNutritionFromPlan(plan, dayIndex) {
  let calories = 0, protein = 0, carbs = 0, fat = 0;
  let sodium = 0, fiber = 0, saturatedFat = 0, sugar = 0;
  for (const mealType of MEAL_TYPES) {
    const dishIds = plan.days[dayIndex]?.[mealType];
    if (!dishIds || !dishIds.length) continue;
    for (const dishId of dishIds) {
      const dish = getDishById(dishId);
      if (!dish) continue;
      calories += dish.calories || 0;
      protein += dish.protein || 0;
      carbs += dish.carbs || 0;
      fat += dish.fat || 0;
      sodium += dish.sodium || 0;
      fiber += dish.fiber || 0;
      saturatedFat += dish.saturatedFat || 0;
      sugar += dish.sugar || 0;
    }
  }
  return {
    calories, protein: Math.round(protein * 10) / 10, carbs: Math.round(carbs * 10) / 10, fat: Math.round(fat * 10) / 10,
    sodium: Math.round(sodium), fiber: Math.round(fiber * 10) / 10,
    saturatedFat: Math.round(saturatedFat * 10) / 10, sugar: Math.round(sugar * 10) / 10
  };
}

function getEffectiveDayNutritionByDate(dateStr) {
  const ws = getMonday(new Date(dateStr + 'T00:00:00'));
  const target = new Date(dateStr + 'T00:00:00');
  const diffDays = Math.floor((target - new Date(ws + 'T00:00:00')) / (1000 * 60 * 60 * 24));
  if (diffDays < 0 || diffDays > 6) return getDayNutritionByDate(dateStr);
  const actNut = getActualDayNutrition(ws, diffDays);
  return actNut.calories > 0 ? actNut : getDayNutritionByDate(dateStr);
}

function getDayNutritionByDate(dateStr) {
  const ws = getMonday(new Date(dateStr + 'T00:00:00'));
  const start = new Date(ws + 'T00:00:00');
  const target = new Date(dateStr + 'T00:00:00');
  const diffDays = Math.floor((target - start) / (1000 * 60 * 60 * 24));
  if (diffDays < 0 || diffDays > 6) return { calories: 0, protein: 0, carbs: 0, fat: 0, sodium: 0, fiber: 0, saturatedFat: 0, sugar: 0, breakfast: 0, lunch: 0, dinner: 0 };
  const plan = getMealPlan(ws);
  let breakfast = 0, lunch = 0, dinner = 0;
  let protein = 0, carbs = 0, fat = 0;
  let sodium = 0, fiber = 0, saturatedFat = 0, sugar = 0;
  for (const mealType of MEAL_TYPES) {
    const dishIds = plan.days[diffDays]?.[mealType];
    if (!dishIds || !dishIds.length) continue;
    for (const dishId of dishIds) {
      const dish = getDishById(dishId);
      if (!dish) continue;
      const cal = dish.calories || 0;
      if (mealType === 'breakfast') breakfast += cal;
      else if (mealType === 'lunch') lunch += cal;
      else dinner += cal;
      protein += dish.protein || 0;
      carbs += dish.carbs || 0;
      fat += dish.fat || 0;
      sodium += dish.sodium || 0;
      fiber += dish.fiber || 0;
      saturatedFat += dish.saturatedFat || 0;
      sugar += dish.sugar || 0;
    }
  }
  return {
    calories: breakfast + lunch + dinner,
    protein: Math.round(protein * 10) / 10, carbs: Math.round(carbs * 10) / 10, fat: Math.round(fat * 10) / 10,
    sodium: Math.round(sodium), fiber: Math.round(fiber * 10) / 10,
    saturatedFat: Math.round(saturatedFat * 10) / 10, sugar: Math.round(sugar * 10) / 10,
    breakfast, lunch, dinner
  };
}

function calcDishNutritionFromIngredients(ingredients, cookingMethodId) {
  const method = COOKING_METHODS.find(m => m.id === cookingMethodId);
  const mult = method ? method.multiplier : 1.0;
  let cal = 0, protein = 0, carbs = 0, fat = 0;
  let sodium = 0, fiber = 0, saturatedFat = 0, sugar = 0;
  for (const item of ingredients) {
    const ing = getIngredientById(item.id);
    if (!ing) continue;
    const ratio = (item.g || 0) / 100;
    cal += (ing.calories || 0) * ratio;
    protein += (ing.protein || 0) * ratio;
    carbs += (ing.carbs || 0) * ratio;
    fat += (ing.fat || 0) * ratio;
    sodium += (ing.sodium || 0) * ratio;
    fiber += (ing.fiber || 0) * ratio;
    saturatedFat += (ing.saturatedFat || 0) * ratio;
    sugar += (ing.sugar || 0) * ratio;
  }
  return {
    calories: Math.round(cal * mult),
    protein: Math.round(protein * mult * 10) / 10,
    carbs: Math.round(carbs * mult * 10) / 10,
    fat: Math.round(fat * mult * 10) / 10,
    sodium: Math.round(sodium * mult),
    fiber: Math.round(fiber * mult * 10) / 10,
    saturatedFat: Math.round(saturatedFat * mult * 10) / 10,
    sugar: Math.round(sugar * mult * 10) / 10
  };
}

function calcDayCalories(weekStart, dayIndex) {
  const plan = getMealPlan(weekStart);
  let total = 0;
  for (const mealType of MEAL_TYPES) {
    const dishIds = plan.days[dayIndex]?.[mealType];
    if (!dishIds || !dishIds.length) continue;
    for (const dishId of dishIds) {
      const dish = getDishById(dishId);
      if (dish) total += dish.calories || 0;
    }
  }
  return total;
}

function getDayCaloriesByDate(dateStr) {
  const ws = getMonday(new Date(dateStr + 'T00:00:00'));
  const start = new Date(ws + 'T00:00:00');
  const target = new Date(dateStr + 'T00:00:00');
  const diffDays = Math.floor((target - start) / (1000 * 60 * 60 * 24));
  if (diffDays < 0 || diffDays > 6) return { breakfast: 0, lunch: 0, dinner: 0, total: 0 };
  const plan = getMealPlan(ws);
  let breakfast = 0, lunch = 0, dinner = 0;
  for (const mealType of MEAL_TYPES) {
    const dishIds = plan.days[diffDays]?.[mealType];
    if (!dishIds || !dishIds.length) continue;
    for (const dishId of dishIds) {
      const dish = getDishById(dishId);
      if (!dish) continue;
      if (mealType === 'breakfast') breakfast += dish.calories;
      else if (mealType === 'lunch') lunch += dish.calories;
      else dinner += dish.calories;
    }
  }
  return { breakfast, lunch, dinner, total: breakfast + lunch + dinner };
}

// ============ 工具函数 ============

function localDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return localDateStr(d);
}

function getWeekEnd(weekStart) {
  const d = new Date(weekStart + 'T00:00:00');
  d.setDate(d.getDate() + 6);
  return localDateStr(d);
}

function shiftWeek(weekStart, delta) {
  const d = new Date(weekStart + 'T00:00:00');
  d.setDate(d.getDate() + delta * 7);
  return localDateStr(d);
}

function generateId(prefix) {
  return (prefix || 'c_') + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
}

function getIngredientById(id) {
  return [...PRESET_INGREDIENTS, ...customIngredients].find(i => i.id === id);
}

function getAllIngredients() {
  return [...PRESET_INGREDIENTS, ...customIngredients];
}

function getDishById(id) {
  return [...buildPresetDishes(), ...customDishes].find(d => d.id === id);
}

function getAllDishes() {
  return [...buildPresetDishes(), ...customDishes];
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ============ localStorage ============

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      users = data.users || [];
      // 迁移旧版 activityLevel → 新版 dailyPAL + exerciseKcal
      for (const u of users) {
        if (!u.dailyPAL && u.activityLevel) {
          const migrationMap = {
            'sedentary': { dailyPAL: '1.4', exerciseKcal: '0' },
            'light': { dailyPAL: '1.4', exerciseKcal: '120' },
            'moderate': { dailyPAL: '1.4', exerciseKcal: '280' },
            'active': { dailyPAL: '1.6', exerciseKcal: '430' },
            'very_active': { dailyPAL: '1.8', exerciseKcal: '600' }
          };
          const m = migrationMap[u.activityLevel] || { dailyPAL: '1.4', exerciseKcal: '120' };
          u.dailyPAL = m.dailyPAL;
          u.exerciseKcal = m.exerciseKcal;
          delete u.activityLevel;
        }
        if (!u.dailyPAL) u.dailyPAL = '1.6';
        if (u.exerciseKcal === undefined || u.exerciseKcal === null) u.exerciseKcal = '120';
      }
      currentUser = data.currentUser || null;
      if (currentUser) {
        if (!currentUser.dailyPAL && currentUser.activityLevel) {
          const migrationMap = {
            'sedentary': { dailyPAL: '1.4', exerciseKcal: '0' },
            'light': { dailyPAL: '1.4', exerciseKcal: '120' },
            'moderate': { dailyPAL: '1.4', exerciseKcal: '280' },
            'active': { dailyPAL: '1.6', exerciseKcal: '430' },
            'very_active': { dailyPAL: '1.8', exerciseKcal: '600' }
          };
          const m = migrationMap[currentUser.activityLevel] || { dailyPAL: '1.4', exerciseKcal: '120' };
          currentUser.dailyPAL = m.dailyPAL;
          currentUser.exerciseKcal = m.exerciseKcal;
          delete currentUser.activityLevel;
        }
        if (!currentUser.dailyPAL) currentUser.dailyPAL = '1.6';
        if (currentUser.exerciseKcal === undefined || currentUser.exerciseKcal === null) currentUser.exerciseKcal = '120';
      }
      mealPlans = data.mealPlans || {};
      actualMeals = data.actualMeals || {};
      // 迁移旧数据：null→[], 字符串→[字符串]
      for (const plans of [mealPlans, actualMeals]) {
        for (const wk of Object.keys(plans)) {
          const days = plans[wk].days;
          if (!days) continue;
          for (let d = 0; d < 7; d++) {
            if (!days[d]) continue;
            for (const mt of MEAL_TYPES) {
              const val = days[d][mt];
              if (val === null || val === undefined) days[d][mt] = [];
              else if (!Array.isArray(val)) days[d][mt] = [val];
            }
          }
        }
      }
      exercisePlans = data.exercisePlans || {};
      customDishes = data.customDishes || [];
      customIngredients = data.customIngredients || [];
      shoppingChecked = data.shoppingChecked || {};
      calorieUnit = data.calorieUnit || 'kcal';
      weightLogs = data.weightLogs || [];
    }
  } catch (e) {
    // Reset on error
    users = []; currentUser = null; mealPlans = {}; actualMeals = {};
    exercisePlans = {}; customDishes = []; customIngredients = []; shoppingChecked = {};
    calorieUnit = 'kcal'; weightLogs = [];
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    users, currentUser, mealPlans, actualMeals, exercisePlans, customDishes,
    customIngredients, shoppingChecked, calorieUnit, weightLogs
  }));
}

// ============ 菜单数据 ============

function getMealPlan(weekStart) {
  if (!mealPlans[weekStart]) {
    mealPlans[weekStart] = { days: {} };
    for (let i = 0; i < 7; i++) {
      mealPlans[weekStart].days[i] = { breakfast: [], lunch: [], dinner: [] };
    }
  }
  return mealPlans[weekStart];
}

function setMeal(weekStart, dayIndex, mealType, dishId) {
  const plan = getMealPlan(weekStart);
  const arr = plan.days[dayIndex][mealType];
  if (!Array.isArray(arr)) {
    // migrate old single-value slot
    plan.days[dayIndex][mealType] = arr ? [arr] : [];
  }
  const items = plan.days[dayIndex][mealType];
  const idx = items.indexOf(dishId);
  if (idx >= 0) {
    items.splice(idx, 1);  // 已选 → 移除
  } else {
    items.push(dishId);    // 未选 → 添加
  }
  saveData();
}

// ---- 实际摄入数据 ----
function getActualMealPlan(weekStart) {
  if (!actualMeals[weekStart]) {
    actualMeals[weekStart] = { days: {} };
    for (let i = 0; i < 7; i++) {
      actualMeals[weekStart].days[i] = { breakfast: [], lunch: [], dinner: [] };
    }
  }
  return actualMeals[weekStart];
}

function setActualMeal(weekStart, dayIndex, mealType, dishId) {
  const plan = getActualMealPlan(weekStart);
  const arr = plan.days[dayIndex][mealType];
  if (!Array.isArray(arr)) {
    plan.days[dayIndex][mealType] = arr ? [arr] : [];
  }
  const items = plan.days[dayIndex][mealType];
  const idx = items.indexOf(dishId);
  if (idx >= 0) {
    items.splice(idx, 1);
  } else {
    items.push(dishId);
  }
  saveData();
}

// ============ 食材聚合（使用新模型） ============

function aggregateShoppingList(weekStart) {
  const plan = getMealPlan(weekStart);
  const ingredientsMap = {};

  for (let d = 0; d < 7; d++) {
    for (const mealType of MEAL_TYPES) {
      const dishIds = plan.days[d]?.[mealType];
      if (!dishIds || !dishIds.length) continue;
      for (const dishId of dishIds) {
        const dish = getDishById(dishId);
        if (!dish || !dish.ingredients) continue;
        for (const item of dish.ingredients) {
          const ing = getIngredientById(item.id);
          const ingName = ing ? ing.name : item.id;
          const key = `${item.id}_${ingName}`;
          if (!ingredientsMap[key]) {
            ingredientsMap[key] = { ingredientId: item.id, name: ingName, totalG: 0, unit: 'g' };
          }
          ingredientsMap[key].totalG += (item.g || 0);
        }
      }
    }
  }
  // Convert grams to readable amounts
  return Object.values(ingredientsMap).map(item => {
    if (item.totalG >= 1000) {
      return { ...item, display: `${(item.totalG / 1000).toFixed(1)} kg` };
    } else if (item.totalG >= 1) {
      return { ...item, display: `${Math.round(item.totalG)} g` };
    } else {
      return { ...item, display: item.totalG + ' g' };
    }
  });
}

// ============ 侧边栏路由 ============

function switchNav(navName) {
  activeNav = navName;
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  // 子页面高亮 dishes
  const highlightNav = (navName === 'customizer' || navName === 'ingredients') ? 'dishes' : navName;
  const navBtn = document.querySelector(`[data-nav="${highlightNav}"]`);
  if (navBtn) navBtn.classList.add('active');
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  const panel = document.getElementById(`panel-${navName}`);
  if (panel) panel.classList.add('active');
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-overlay').classList.add('hidden');
  renderActivePanel();
}

function renderActivePanel() {
  switch (activeNav) {
    case 'user': renderUsers(); break;
    case 'planner': renderMealPlanner(); break;
    case 'analysis': renderCalorieAnalysis(); break;
    case 'shopping': renderShoppingList(); break;
    case 'dishes': renderDishLibrary(); break;
    case 'ingredients': renderIngredientLibrary(); break;
    case 'customizer': renderDishCustomizer(); break;
  }
}

// ============ 渲染：用户 ============

function renderUsers() {
  const wrap = document.getElementById('user-content');
  const showStats = document.getElementById('user-stats');
  const formWrap = document.getElementById('user-form-wrap');

  // User list
  if (users.length === 0) {
    wrap.innerHTML = '<p style="color:var(--text-secondary);margin-bottom:16px;">还没有用户，请创建第一个用户来开始使用。</p>';
    showStats.classList.add('hidden');
  } else {
    wrap.innerHTML = `<div class="user-list">${users.map(u => `
      <div class="user-card ${currentUser && currentUser.id === u.id ? 'active-user' : ''}" data-user-id="${u.id}">
        <div class="user-avatar ${u.gender}">${u.name.charAt(0)}</div>
        <div class="user-info">
          <div class="user-card-name">${u.name}</div>
          <div class="user-card-meta">${u.gender === 'male' ? '男' : '女'} · ${u.age}岁 · ${u.height}cm · ${u.weight}kg${u.bodyFat ? ' · 体脂' + u.bodyFat + '%' : ''} · ${u.targetHabit === 'lose' ? '减重' : u.targetHabit === 'gain' ? '增重' : '维持'}</div>
        </div>
        <button class="btn btn-sm btn-edit-user" data-user-id="${u.id}">编辑</button>
        <button class="btn btn-sm btn-danger btn-delete-user" data-user-id="${u.id}">删除</button>
      </div>`).join('')}</div>`;
  }

  // Show stats for current user
  if (currentUser) {
    const bmr = Math.round(calcBMR(currentUser));
    const tdee = calcTDEE(currentUser);
    const target = calcTargetCalories(currentUser);
    const macros = calcMacroTargets(currentUser);
    const bmrMethod = currentUser.bodyFat ? 'Katch-McArdle (基于体脂率)' : 'Mifflin-St Jeor';
    const dailyPAL = parseFloat(currentUser.dailyPAL) || 1.4;
    const dailyExpenditure = Math.round(bmr * dailyPAL);
    const exerciseKcal = parseInt(currentUser.exerciseKcal) || 0;
    const palLabels = { '1.4': '久坐办公', '1.5': '久坐+偶尔走动', '1.6': '轻度活动', '1.8': '中度体力', '2.0': '重度体力', '2.2': '极重度' };
    const exLabels = { '0': '几乎不运动', '120': '每周1-2次', '280': '每周3-4次', '430': '每周5-6次', '600': '每天高强度' };
    const palLabel = palLabels[currentUser.dailyPAL] || '久坐办公';
    const exLabel = exLabels[currentUser.exerciseKcal] || '几乎不运动';
    const isFineMode = currentUser.exerciseMode === 'fine';
    const dailyDeficit = tdee - target;
    const atFloor = (currentUser.targetHabit === 'lose' && target <= Math.max(bmr, 1200));

    showStats.classList.remove('hidden');
    showStats.innerHTML = `
      <h3 style="margin-top:16px;margin-bottom:10px;">📊 ${currentUser.name} 的身体数据</h3>
      <div class="user-stats-grid">
        <div class="user-stat-card"><div class="stat-value">${fmtKcal(bmr)}</div><div class="stat-label">基础代谢 BMR (${calUnit()}/天) · ${bmrMethod}</div></div>
        <div class="user-stat-card"><div class="stat-value">${fmtKcal(tdee)}</div><div class="stat-label">每日消耗 TDEE (${calUnit()}/天)</div></div>
        <div class="user-stat-card"><div class="stat-value">${fmtKcal(target)}</div><div class="stat-label">目标摄入 (${calUnit()}/天)</div></div>
        <div class="user-stat-card"><div class="stat-value">${currentUser.targetWeight} kg</div><div class="stat-label">目标体重${currentUser.targetBodyFat ? ' · 体脂 ' + currentUser.targetBodyFat + '%' : ''}</div></div>
      </div>
      ${currentUser.bodyFat ? `<div class="user-stats-grid" style="margin-top:8px;">
        <div class="user-stat-card"><div class="stat-value">${currentUser.bodyFat}%</div><div class="stat-label">当前体脂率</div></div>
        <div class="user-stat-card"><div class="stat-value">${Math.round(currentUser.weight * (1 - currentUser.bodyFat / 100) * 10) / 10} kg</div><div class="stat-label">瘦体重 (LBM)</div></div>
        <div class="user-stat-card"><div class="stat-value">${Math.round(currentUser.weight * currentUser.bodyFat / 100 * 10) / 10} kg</div><div class="stat-label">脂肪重量</div></div>
      </div>` : ''}
      ${renderTargetDateStats(currentUser)}
      <!-- 热量计算明细 -->
      <div class="calc-breakdown">
        <h4>📐 热量计算明细（1 kcal = 4.184 kJ）</h4>
        <div class="breakdown-steps">
          <div class="breakdown-step"><span>BMR 基础代谢</span><strong>${fmtCal(bmr)}</strong><small>${bmrMethod} 公式</small></div>
          <div class="breakdown-step"><span>× 日常活动系数</span><strong>${dailyPAL}</strong><small>${palLabel}（含非运动消耗 + 食物热效应）</small></div>
          <div class="breakdown-step"><span>= 日常消耗（含TEF）</span><strong>${fmtCal(dailyExpenditure)}</strong><small>BMR × PAL = ${fmtKcal(bmr)} × ${dailyPAL}</small></div>
          ${exerciseKcal > 0 ? `
          <div class="breakdown-step"><span>+ 运动锻炼消耗</span><strong>+${fmtCal(exerciseKcal)}/天</strong><small>${exLabel}，平均到每天约 ${fmtCal(exerciseKcal)}</small></div>
          ` : `
          <div class="breakdown-step"><span>+ 运动锻炼消耗</span><strong>0 ${calUnit()}</strong><small>${exLabel}</small></div>
          `}
          <div class="breakdown-step result-step"><span>= TDEE 每日总消耗</span><strong>${fmtCal(tdee)}</strong><small>日常消耗 + 运动消耗</small></div>
          ${target !== tdee ? `
          <div class="breakdown-step ${dailyDeficit > 0 ? 'deficit-step' : 'surplus-step'}"><span>${dailyDeficit > 0 ? '− 热量缺口' : '+ 热量盈余'}</span><strong>${fmtCal(Math.abs(dailyDeficit))}</strong><small>${currentUser.targetDate ? '由目标日期倒推' : '默认 ±' + fmtCal(500) + '/天'}</small></div>
          <div class="breakdown-step result-step"><span>= 目标摄入</span><strong>${fmtCal(target)}</strong><small>${atFloor ? '⚠️ 已触达基础代谢下限，无法再低' : '每日应摄入热量'}</small></div>
          ` : `
          <div class="breakdown-step result-step"><span>= 目标摄入</span><strong>${fmtCal(target)}</strong><small>维持当前体重</small></div>
          `}
        </div>
        ${dailyDeficit > 0 ? `<p class="breakdown-note">📌 每日 ${fmtCal(Math.abs(dailyDeficit))} 缺口 ≈ 预计每月减重 <strong>${(Math.abs(dailyDeficit) * 30 / 7700).toFixed(1)} kg</strong>（理论值，实际因人而异）</p>` : ''}
        ${dailyDeficit < 0 ? `<p class="breakdown-note">📌 每日 ${fmtCal(Math.abs(dailyDeficit))} 盈余 ≈ 预计每月增重 <strong>${(Math.abs(dailyDeficit) * 30 / 7700).toFixed(1)} kg</strong>（理论值，实际因人而异）</p>` : ''}
        ${isFineMode ? `<p class="breakdown-note">🔧 当前使用<strong>精细估算模式</strong>，每日 TDEE 根据实际运动量变化，请在菜单规划中设置每天的运动。</p>` : `<p class="breakdown-note">🔧 当前使用<strong>粗略估算模式</strong>（日均固定值），可在编辑用户时切换为精细估算。</p>`}
      </div>
      <h3 style="margin-top:16px;margin-bottom:10px;">🎯 每日营养素目标</h3>
      <div class="user-stats-grid">
        <div class="user-stat-card macro-protein"><div class="stat-value">${macros.protein}g</div><div class="stat-label">蛋白质</div></div>
        <div class="user-stat-card macro-carbs"><div class="stat-value">${macros.carbs}g</div><div class="stat-label">碳水化合物</div></div>
        <div class="user-stat-card macro-fat"><div class="stat-value">${macros.fat}g</div><div class="stat-label">脂肪</div></div>
      </div>`;
  } else {
    showStats.classList.add('hidden');
  }

  // Add button
  wrap.innerHTML += '<button class="btn btn-primary" id="btn-show-add-user">+ 添加用户</button>';
  // Render weight tracking section
  renderWeightSection();
}

function showUserForm(user) {
  const formWrap = document.getElementById('user-form-wrap');
  formWrap.classList.remove('hidden');
  document.getElementById('user-form-title').textContent = user ? '编辑用户' : '添加用户';
  document.getElementById('user-id').value = user ? user.id : '';
  document.getElementById('user-name').value = user ? user.name : '';
  document.getElementById('user-age').value = user ? user.age : 30;
  document.getElementById('user-gender').value = user ? user.gender : 'male';
  document.getElementById('user-height').value = user ? user.height : 170;
  document.getElementById('user-weight').value = user ? user.weight : 65;
  const bfEl = document.getElementById('user-bodyfat');
  if (bfEl) bfEl.value = user && user.bodyFat ? user.bodyFat : '';
  document.getElementById('user-daily-pal').value = user ? (user.dailyPAL || '1.4') : '1.6';
  document.getElementById('user-exercise-level').value = user ? (user.exerciseKcal || '120') : '120';
  document.getElementById('user-exercise-mode').value = user ? (user.exerciseMode || 'rough') : 'rough';
  document.getElementById('user-target-weight').value = user ? user.targetWeight : 60;
  const tbfEl = document.getElementById('user-target-bodyfat');
  if (tbfEl) tbfEl.value = user && user.targetBodyFat ? user.targetBodyFat : '';
  document.getElementById('user-target-habit').value = user ? user.targetHabit : 'lose';
  document.getElementById('user-target-date').value = user ? (user.targetDate || '') : '';
  formWrap.scrollIntoView({ behavior: 'smooth' });
}

// ============ 渲染：菜单规划 ============

function renderMealPlanner() {
  const ws = currentWeekStart;
  const we = getWeekEnd(ws);
  document.getElementById('week-label').textContent = `${ws} ~ ${we}`;
  const plan = getMealPlan(ws);
  const actualPlan = getActualMealPlan(ws);
  const grid = document.getElementById('meal-grid');
  const targetCal = currentUser ? calcTargetCalories(currentUser) : null;
  const macroTargets = currentUser ? calcMacroTargets(currentUser) : null;

  // 计算每日营养（计划 + 实际）
  const dayNutrition = [];
  const actualDayNutrition = [];
  let hasActualData = false;
  for (let d = 0; d < 7; d++) {
    dayNutrition.push(getDayNutrition(ws, d));
    const aNut = getActualDayNutrition(ws, d);
    actualDayNutrition.push(aNut);
    if (aNut.calories > 0) hasActualData = true;
  }

  let html = '<div class="meal-cell header"></div>';
  for (let i = 0; i < 7; i++) {
    const date = new Date(ws + 'T00:00:00');
    date.setDate(date.getDate() + i);
    html += `<div class="meal-cell header">${DAY_LABELS[i]}<br>${date.getMonth() + 1}/${date.getDate()}</div>`;
  }
  for (let m = 0; m < 3; m++) {
    html += `<div class="meal-cell meal-label ${MEAL_TYPES[m]}">${MEAL_LABELS[m]}</div>`;
    for (let d = 0; d < 7; d++) {
      const dishIds = plan.days[d]?.[MEAL_TYPES[m]];
      const dishes = (Array.isArray(dishIds) ? dishIds : (dishIds ? [dishIds] : []))
        .map(id => getDishById(id)).filter(Boolean);
      const actualDishIds = actualPlan.days[d]?.[MEAL_TYPES[m]];
      const actualDishes = (Array.isArray(actualDishIds) ? actualDishIds : (actualDishIds ? [actualDishIds] : []))
        .map(id => getDishById(id)).filter(Boolean);

      html += `<div class="meal-cell meal-slot" data-day="${d}" data-meal="${MEAL_TYPES[m]}">`;
      if (dishes.length > 0) {
        for (const dish of dishes) {
          html += `<div class="dish-chip"><span class="dish-name">${dish.name}</span><span class="dish-cal">${fmtCal(dish.calories)}</span></div>`;
        }
      } else {
        html += '<span class="dish-placeholder">+ 添加</span>';
      }
      // 实际摄入显示
      for (const aDish of actualDishes) {
        const inPlan = dishes.some(d => d.id === aDish.id);
        if (!inPlan) {
          html += `<div class="dish-chip dish-chip-actual"><span class="dish-name">实: ${aDish.name}</span><span class="dish-cal">${fmtCal(aDish.calories)}</span></div>`;
        }
      }
      html += `<button class="btn-actual-meal" data-day="${d}" data-meal="${MEAL_TYPES[m]}" title="记录实际摄入">📝</button>`;
      html += '</div>';
    }
  }

  // --- 使用实际数据（有则用实际，无则用计划）---
  const effectiveNutrition = dayNutrition.map((plan, i) => {
    const act = actualDayNutrition[i];
    return act.calories > 0 ? act : plan;
  });

  // --- 精细模式：每日 TDEE 数组 ---
  const isFineMode = currentUser && currentUser.exerciseMode === 'fine';
  const dayTDEEs = [];
  const dayTargets = [];
  if (currentUser) {
    const baseTDEE = calcTDEE(currentUser);
    const baseTarget = calcTargetCalories(currentUser);
    const dailyDeficit = baseTDEE - baseTarget; // 固定的热量缺口
    for (let d = 0; d < 7; d++) {
      const dTDEE = isFineMode ? getEffectiveDayTDEE(currentUser, ws, d) : baseTDEE;
      dayTDEEs.push(dTDEE);
      dayTargets.push(currentUser.targetHabit === 'maintain' ? dTDEE : dTDEE - dailyDeficit);
    }
  }

  // --- 精细模式：运动行 ---
  if (isFineMode) {
    html += '<div class="meal-cell meal-label ex-label">运动</div>';
    for (let d = 0; d < 7; d++) {
      const info = getDayExerciseInfo(ws, d);
      const preset = info ? EXERCISE_PRESETS.find(p => p.id === info.preset) : null;
      const exKcal = getDayExerciseKcal(ws, d);
      const label = preset && preset.id !== 'rest' ? preset.name : (exKcal > 0 ? `${fmtCal(exKcal)}` : '休息');
      html += `<div class="meal-cell meal-exercise-cell${exKcal > 0 ? ' has-exercise' : ''}" data-ex-day="${d}" title="点击设置运动">${label}${exKcal > 0 ? `<span class="ex-kcal">+${fmtKcal(exKcal)}</span>` : ''}</div>`;
    }

    // --- 精细模式：TDEE 行 ---
    html += '<div class="meal-cell meal-label tdee-label">TDEE</div>';
    for (let d = 0; d < 7; d++) {
      html += `<div class="meal-cell meal-tdee-cell">${fmtCal(dayTDEEs[d], false)}</div>`;
    }
  }

  // --- 每日合计行 ---
  html += '<div class="meal-cell meal-label total-label">摄入</div>';
  for (let d = 0; d < 7; d++) {
    const cal = effectiveNutrition[d].calories;
    html += `<div class="meal-cell meal-total-cell">${cal > 0 ? fmtCal(cal, false) : '-'}</div>`;
  }

  // --- 热量缺口行 ---
  if (currentUser && dayTargets.length > 0) {
    html += '<div class="meal-cell meal-label deficit-label">缺口</div>';
    for (let d = 0; d < 7; d++) {
      const cal = effectiveNutrition[d].calories;
      if (cal > 0) {
        const diff = dayTargets[d] - cal;
        const cls = diff >= 0 ? 'deficit-good' : 'deficit-bad';
        const sign = diff >= 0 ? '-' : '+';
        html += `<div class="meal-cell meal-deficit-cell ${cls}">${sign}${fmtKcal(Math.abs(diff))}</div>`;
      } else {
        html += '<div class="meal-cell meal-deficit-cell">-</div>';
      }
    }
  }

  // --- 营养素实际值行 + 缺口行 ---
  if (macroTargets) {
    const macroRows = [
      { key: 'protein', label: '蛋白质', unit: 'g', target: macroTargets.protein },
      { key: 'carbs', label: '碳水', unit: 'g', target: macroTargets.carbs },
      { key: 'fat', label: '脂肪', unit: 'g', target: macroTargets.fat },
      { key: 'fiber', label: '膳食纤维', unit: 'g', target: macroTargets.fiber },
      { key: 'sodium', label: '钠', unit: 'mg', target: macroTargets.sodium, warnHigh: true, warnLabel: '钠超标', warnThreshold: macroTargets.sodium },
      { key: 'saturatedFat', label: '饱和脂肪', unit: 'g', target: macroTargets.saturatedFat, warnHigh: true, warnLabel: '饱和脂肪超标', warnThreshold: macroTargets.saturatedFat },
      { key: 'sugar', label: '糖', unit: 'g', target: macroTargets.sugar, warnHigh: true, warnLabel: '糖超标', warnThreshold: macroTargets.sugar }
    ];
    for (const row of macroRows) {
      html += `<div class="meal-cell meal-label macro-label">${row.label}</div>`;
      for (let d = 0; d < 7; d++) {
        const val = effectiveNutrition[d][row.key];
        const warn = row.warnHigh && val > row.warnThreshold;
        html += `<div class="meal-cell meal-macro-cell${warn ? ' macro-warn' : ''}">${val > 0 ? val + row.unit : '-'}${warn ? ' ⚠️' : ''}</div>`;
      }
      html += `<div class="meal-cell meal-label macro-deficit-label">${row.label}差</div>`;
      for (let d = 0; d < 7; d++) {
        const val = effectiveNutrition[d][row.key];
        const t = row.target;
        if (val > 0) {
          const diff = t - val;
          // For high-warning nutrients, surplus is bad (over target)
          const isUnder = row.warnHigh ? (diff >= 0) : (diff >= 0);
          const cls = row.warnHigh
            ? (diff >= 0 ? 'deficit-good' : 'deficit-bad')
            : (Math.abs(diff) < t * 0.1 ? 'deficit-good' : (diff > 0 ? 'macro-under' : 'deficit-bad'));
          const sign = diff >= 0 ? '-' : '+';
          html += `<div class="meal-cell meal-deficit-cell ${cls}">${sign}${Math.abs(diff)}${row.unit}</div>`;
        } else {
          html += '<div class="meal-cell meal-deficit-cell">-</div>';
        }
      }
    }
  }

  // --- 如果记录了实际摄入，显示计划 vs 实际对比 ---
  if (hasActualData) {
    html += '<div class="meal-cell meal-label actual-divider" style="grid-column:1/-1;font-size:10px;padding:4px;text-align:center;background:#fff3cd;">📋 以下为计划数据（上方为实际摄入）</div>';
    // 计划热量合计
    html += '<div class="meal-cell meal-label total-label">计划热量</div>';
    for (let d = 0; d < 7; d++) {
      const cal = dayNutrition[d].calories;
      html += `<div class="meal-cell meal-total-cell" style="opacity:0.6;">${cal > 0 ? fmtCal(cal, false) : '-'}</div>`;
    }
    if (targetCal) {
      html += '<div class="meal-cell meal-label deficit-label">计划缺口</div>';
      for (let d = 0; d < 7; d++) {
        const cal = dayNutrition[d].calories;
        if (cal > 0) {
          const diff = targetCal - cal;
          const cls = diff >= 0 ? 'deficit-good' : 'deficit-bad';
          const sign = diff >= 0 ? '-' : '+';
          html += `<div class="meal-cell meal-deficit-cell ${cls}" style="opacity:0.6;">${sign}${fmtKcal(Math.abs(diff))}</div>`;
        } else {
          html += '<div class="meal-cell meal-deficit-cell">-</div>';
        }
      }
    }
  }

  grid.innerHTML = html;

  // --- 一周统计卡片（使用实际数据）---
  const dayCalories = effectiveNutrition.map(n => n.calories);
  renderWeekSummary(dayCalories, targetCal, effectiveNutrition, macroTargets);
}

function renderWeekSummary(dayTotals, targetCal, dayNutrition, macroTargets) {
  let container = document.getElementById('week-summary');
  if (!container) {
    container = document.createElement('div');
    container.id = 'week-summary';
    document.getElementById('meal-grid').after(container);
  }

  const trackedDays = dayTotals.filter(t => t > 0).length;
  const weekTotal = dayTotals.reduce((a, b) => a + b, 0);
  const weekAvg = trackedDays > 0 ? Math.round(weekTotal / trackedDays) : 0;

  let html = '<div class="week-summary-cards">';
  html += `<div class="summary-card"><div class="summary-value">${fmtKcal(weekTotal)}</div><div class="summary-label">周总摄入 (${calUnit()})</div></div>`;
  html += `<div class="summary-card"><div class="summary-value">${fmtKcal(weekAvg)}</div><div class="summary-label">日均摄入 (${calUnit()})</div></div>`;
  html += `<div class="summary-card"><div class="summary-value">${trackedDays}/7</div><div class="summary-label">已规划天数</div></div>`;

  if (targetCal) {
    const weekTarget = targetCal * 7;
    const weekDiff = weekTarget - weekTotal;
    const weeklyDeficit = weekTotal > 0 ? weekDiff : 0;
    const cls = weeklyDeficit >= 0 ? 'deficit' : 'surplus';
    const sign = weeklyDeficit >= 0 ? '-' : '+';
    const estWeightChange = (Math.abs(weeklyDeficit) / 7700).toFixed(1);
    html += `<div class="summary-card ${cls}"><div class="summary-value">${sign}${fmtKcal(Math.abs(weeklyDeficit))}</div><div class="summary-label">周热量${weeklyDeficit >= 0 ? '缺口' : '盈余'} (${calUnit()})</div></div>`;
    html += `<div class="summary-card"><div class="summary-value">${fmtKcal(targetCal)}</div><div class="summary-label">每日目标 (${calUnit()})</div></div>`;
    if (weekTotal > 0) {
      html += `<div class="summary-card"><div class="summary-value">~${estWeightChange} kg</div><div class="summary-label">估算体重变化</div></div>`;
    }
  }

  // 营养素周均值
  if (macroTargets && dayNutrition && trackedDays > 0) {
    const avgNut = (key) => Math.round(dayNutrition.reduce((s, n) => s + (n[key] || 0), 0) / trackedDays);

    const makeMacroCard = (label, actual, target, unit, warnHigh) => {
      const diff = target - actual;
      const cls = warnHigh ? (actual > target ? 'surplus' : 'deficit') : (Math.abs(diff) < target * 0.15 ? 'deficit' : (diff > 0 ? 'surplus' : 'surplus'));
      const hint = warnHigh ? (actual > target ? `超 ${actual - target}${unit} ⚠️` : (diff > 0 ? `余 ${diff}${unit}` : '达标')) : (diff > 0 ? `缺 ${diff}${unit}` : `超 ${Math.abs(diff)}${unit}`);
      return `<div class="summary-card ${cls}"><div class="summary-value">${actual}<span style="font-size:12px;color:var(--text-secondary);">/${target}</span></div><div class="summary-label">日均${label} (${unit}) <span style="font-size:10px">${hint}</span></div></div>`;
    };

    html += makeMacroCard('蛋白质', avgNut('protein'), macroTargets.protein, 'g', false);
    html += makeMacroCard('碳水', avgNut('carbs'), macroTargets.carbs, 'g', false);
    html += makeMacroCard('脂肪', avgNut('fat'), macroTargets.fat, 'g', false);
    html += makeMacroCard('膳食纤维', avgNut('fiber'), macroTargets.fiber, 'g', false);
    html += makeMacroCard('钠', avgNut('sodium'), macroTargets.sodium, 'mg', true);
    html += makeMacroCard('饱和脂肪', avgNut('saturatedFat'), macroTargets.saturatedFat, 'g', true);
    html += makeMacroCard('糖', avgNut('sugar'), macroTargets.sugar, 'g', true);
  }

  html += '</div>';
  container.innerHTML = html;
}

// ============ 数据导出 ============
function exportData() {
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mealplanner_backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// ============ 体重追踪 ============
function getWeightStats() {
  if (!currentUser || weightLogs.length === 0) return null;
  const sorted = [...weightLogs].sort((a, b) => a.date.localeCompare(b.date));
  const latest = sorted[sorted.length - 1];
  const first = sorted[0];
  const totalChange = latest.weight - first.weight;
  const days = Math.max(1, (new Date(latest.date) - new Date(first.date)) / (1000 * 60 * 60 * 24));
  const weeklyRate = totalChange / (days / 7);
  // Estimate time to target
  const remaining = currentUser.targetWeight - latest.weight;
  const estDays = weeklyRate !== 0 ? Math.abs(remaining / (weeklyRate / 7)) : Infinity;
  const estWeeks = isFinite(estDays) ? Math.round(estDays / 7 * 10) / 10 : null;
  return { latest, first, totalChange, weeklyRate, remaining, estWeeks, sorted };
}

function renderWeightSection() {
  const container = document.getElementById('weight-section');
  if (!container) return;

  const stats = getWeightStats();
  let html = '<h3 style="margin-top:16px;">体重记录</h3>';

  // 录入表单
  html += `<div class="weight-entry">
    <input type="date" id="weight-date" value="${new Date().toISOString().split('T')[0]}">
    <input type="number" id="weight-value" placeholder="体重 (kg)" min="20" max="300" step="0.1" value="${currentUser ? currentUser.weight : 65}">
    <button class="btn btn-primary" id="btn-add-weight">记录体重</button>
    <button class="btn btn-sm" id="btn-export-data" style="margin-left:4px;">导出备份</button>
  </div>`;

  if (stats) {
    const dir = stats.totalChange <= 0 ? '↓' : '↑';
    html += `<div class="user-stats-grid">
      <div class="user-stat-card"><div class="stat-value">${stats.latest.weight} kg</div><div class="stat-label">最新体重 (${stats.latest.date})</div></div>
      <div class="user-stat-card"><div class="stat-value">${dir}${Math.abs(stats.totalChange).toFixed(1)} kg</div><div class="stat-label">总变化 (${stats.sorted.length} 条记录)</div></div>
      <div class="user-stat-card"><div class="stat-value">${stats.weeklyRate > 0 ? '+' : ''}${stats.weeklyRate.toFixed(2)} kg/周</div><div class="stat-label">周均变化速度</div></div>`;

    if (stats.estWeeks && currentUser.targetHabit !== 'maintain') {
      const habitLabel = currentUser.targetHabit === 'lose' ? '减至' : '增至';
      html += `<div class="user-stat-card"><div class="stat-value">~${stats.estWeeks} 周</div><div class="stat-label">预计${habitLabel} ${currentUser.targetWeight} kg</div></div>`;
    }
    html += '</div>';

    // Simple weight trend list
    const recent = stats.sorted.slice(-14);
    html += '<div style="margin-top:12px;"><strong>近期记录：</strong><div class="weight-list">';
    for (const w of recent.reverse()) {
      html += `<span class="weight-chip">${w.date}: ${w.weight} kg</span>`;
    }
    html += '</div></div>';
  }

  container.innerHTML = html;
}

// ============ 渲染：热量分析 ============

function renderCalorieAnalysis(view = 'day') {
  // Update view buttons
  document.querySelectorAll('.analysis-view-btn').forEach(b => b.classList.remove('active'));
  const activeBtn = document.querySelector(`[data-analysis-view="${view}"]`);
  if (activeBtn) activeBtn.classList.add('active');

  const noUserEl = document.getElementById('analysis-no-user');
  const content = document.getElementById('analysis-content');

  if (!currentUser) {
    noUserEl.classList.remove('hidden');
    content.innerHTML = '';
    return;
  }
  noUserEl.classList.add('hidden');

  const targetCal = calcTargetCalories(currentUser);

  if (view === 'day') {
    renderDayAnalysis(targetCal);
  } else if (view === 'week') {
    renderWeekAnalysis(targetCal);
  } else {
    renderMonthAnalysis(targetCal);
  }
}

function macroDeficitCard(label, actual, target, unit) {
  const diff = target - actual;
  const pct = target > 0 ? Math.round((actual / target) * 100) : 0;
  let cls = 'neutral';
  let statusText = '达标';
  if (pct < 75) { cls = 'surplus'; statusText = '严重不足'; }
  else if (pct < 90) { cls = 'surplus'; statusText = '不足'; }
  else if (pct <= 110) { cls = 'deficit'; statusText = '达标'; }
  else if (pct <= 130) { cls = 'surplus'; statusText = '超标'; }
  else { cls = 'surplus'; statusText = '严重超标'; }

  const sign = diff > 0 ? '-' : diff < 0 ? '+' : '';
  return `<div class="analysis-card ${cls}">
    <div class="analysis-value">${actual} / ${target} ${unit}</div>
    <div class="analysis-label">${label} · ${statusText} · ${sign}${Math.abs(diff)}${unit} · 达成率 ${pct}%</div>
  </div>`;
}

function renderDayAnalysis(targetCal) {
  const picker = document.getElementById('analysis-day-picker');
  const date = picker ? picker.value : new Date().toISOString().split('T')[0];
  const nut = getEffectiveDayNutritionByDate(date);
  const total = nut.calories;
  const deficit = targetCal - total;
  let statusCls = 'neutral';
  if (deficit > 100) statusCls = 'deficit';
  else if (deficit < -100) statusCls = 'surplus';

  const macros = calcMacroTargets(currentUser);

  const macroBar = (label, actual, target, unit) => {
    const pct = Math.min((actual / Math.max(target, 1)) * 100, 100);
    const over = actual > target;
    return `<div class="chart-row">
      <div class="chart-label">${label}</div>
      <div class="chart-bar-wrap">
        <div class="chart-bar calories-actual" style="width:${pct}%;${over ? 'background:#d94a4a;' : ''}">${actual}${unit}</div>
        <div class="chart-bar calories-target" style="width:${pct <= 100 ? 100 : (target / actual * 100)}%"></div>
      </div>
      <span style="font-size:10px;color:var(--text-secondary);margin-left:8px;">/${target}${unit}</span>
    </div>`;
  };

  document.getElementById('analysis-content').innerHTML = `
    <div class="analysis-day-selector">
      <span>日期：</span>
      <input type="date" id="analysis-day-picker" value="${date}">
    </div>
    <div class="analysis-cards">
      <div class="analysis-card"><div class="analysis-value">${fmtKcal(total)}</div><div class="analysis-label">今日摄入 (${calUnit()})</div></div>
      <div class="analysis-card"><div class="analysis-value">${fmtKcal(targetCal)}</div><div class="analysis-label">目标热量 (${calUnit()})</div></div>
      <div class="analysis-card ${statusCls}"><div class="analysis-value">${deficit > 0 ? '-' + fmtKcal(deficit) : '+' + fmtKcal(Math.abs(deficit))}</div><div class="analysis-label">热量${deficit > 0 ? '缺口' : '盈余'} (${calUnit()})</div></div>
    </div>
    <div class="analysis-chart-wrap">
      <div class="analysis-chart-title">三餐热量分布（目标：早30% · 午40% · 晚30%）</div>
      ${macroBar('早餐', fmtKcal(nut.breakfast), fmtKcal(Math.round(targetCal * 0.3)), ' ' + calUnit())}
      ${macroBar('午餐', fmtKcal(nut.lunch), fmtKcal(Math.round(targetCal * 0.4)), ' ' + calUnit())}
      ${macroBar('晚餐', fmtKcal(nut.dinner), fmtKcal(Math.round(targetCal * 0.3)), ' ' + calUnit())}
    </div>
    <div class="analysis-chart-wrap" style="margin-top:16px;">
      <div class="analysis-chart-title">营养素摄入 vs 目标</div>
      ${macroBar('蛋白质', nut.protein, macros.protein, 'g')}
      ${macroBar('碳水', nut.carbs, macros.carbs, 'g')}
      ${macroBar('脂肪', nut.fat, macros.fat, 'g')}
      ${macroBar('膳食纤维', nut.fiber || 0, macros.fiber, 'g')}
      ${macroBar('钠', nut.sodium || 0, macros.sodium, 'mg')}
      ${macroBar('饱和脂肪', nut.saturatedFat || 0, macros.saturatedFat, 'g')}
      ${macroBar('糖', nut.sugar || 0, macros.sugar, 'g')}
    </div>
    <div class="analysis-cards" style="margin-top:12px;">
      ${macroDeficitCard('蛋白质', nut.protein, macros.protein, 'g')}
      ${macroDeficitCard('碳水', nut.carbs, macros.carbs, 'g')}
      ${macroDeficitCard('脂肪', nut.fat, macros.fat, 'g')}
      ${macroDeficitCard('膳食纤维', nut.fiber || 0, macros.fiber, 'g')}
      ${macroDeficitCard('钠', nut.sodium || 0, macros.sodium, 'mg')}
      ${macroDeficitCard('饱和脂肪', nut.saturatedFat || 0, macros.saturatedFat, 'g')}
      ${macroDeficitCard('糖', nut.sugar || 0, macros.sugar, 'g')}
    </div>
  `;
}

function renderWeekAnalysis(targetCal) {
  const ws = currentWeekStart;
  const daysData = [];
  let weekTotal = 0;
  let daysWithMeals = 0;

  for (let d = 0; d < 7; d++) {
    const planNut = getDayNutrition(ws, d);
    const actNut = getActualDayNutrition(ws, d);
    const nut = actNut.calories > 0 ? actNut : planNut;
    daysData.push(nut.calories);
    weekTotal += nut.calories;
    if (nut.calories > 0) daysWithMeals++;
  }

  const avgDaily = daysWithMeals > 0 ? Math.round(weekTotal / daysWithMeals) : 0;
  const weekDeficit = targetCal * 7 - weekTotal;

  // 计算周营养素均值
  const macros = calcMacroTargets(currentUser);
  let weekNut = { protein: 0, carbs: 0, fat: 0, sodium: 0, fiber: 0, saturatedFat: 0, sugar: 0 };
  const nutKeys = ['protein', 'carbs', 'fat', 'sodium', 'fiber', 'saturatedFat', 'sugar'];
  for (let d = 0; d < 7; d++) {
    const pn = getDayNutrition(ws, d);
    const an = getActualDayNutrition(ws, d);
    const n = an.calories > 0 ? an : pn;
    if (n.calories > 0) {
      for (const k of nutKeys) weekNut[k] += (n[k] || 0);
    }
  }
  const avg = {};
  for (const k of nutKeys) avg[k] = daysWithMeals > 0 ? Math.round(weekNut[k] / daysWithMeals) : 0;

  let html = `<div class="analysis-cards">
    <div class="analysis-card"><div class="analysis-value">${fmtKcal(weekTotal)}</div><div class="analysis-label">本周摄入 (${calUnit()})</div></div>
    <div class="analysis-card"><div class="analysis-value">${fmtKcal(targetCal * 7)}</div><div class="analysis-label">本周目标 (${calUnit()})</div></div>
    <div class="analysis-card ${weekDeficit > 0 ? 'deficit' : 'surplus'}"><div class="analysis-value">${weekDeficit > 0 ? '-' : '+'}${fmtKcal(Math.abs(weekDeficit))}</div><div class="analysis-label">周热量${weekDeficit > 0 ? '缺口' : '盈余'} (${calUnit()})</div></div>
    <div class="analysis-card"><div class="analysis-value">${fmtKcal(avgDaily)}</div><div class="analysis-label">日均摄入 (${calUnit()})</div></div>
  </div>`;

  html += '<div class="analysis-chart-wrap"><div class="analysis-chart-title">每日摄入 vs 目标</div>';
  const maxVal = Math.max(targetCal, ...daysData, 100);
  for (let d = 0; d < 7; d++) {
    const pct = Math.min((daysData[d] / maxVal) * 100, 100);
    const targetPct = Math.min((targetCal / maxVal) * 100, 100);
    const overTarget = daysData[d] > targetCal;
    html += `<div class="chart-row">
      <div class="chart-label">${DAY_LABELS[d]}</div>
      <div class="chart-bar-wrap">
        <div class="chart-bar calories-actual" style="width:${pct}%;${overTarget ? 'background:#d94a4a;' : ''}">${daysData[d] > 0 ? fmtKcal(daysData[d]) : ''}</div>
        <div class="chart-bar calories-target" style="width:${targetPct}%"></div>
      </div>
    </div>`;
  }
  html += '<div style="font-size:11px;color:var(--text-secondary);margin-top:8px;">注：浅色区域为目标线 (' + fmtKcal(targetCal) + ' ' + calUnit() + '/天)</div>';
  html += '</div>';

  // 周营养素均值
  html += '<div class="analysis-chart-wrap" style="margin-top:16px;"><div class="analysis-chart-title">日均营养素 vs 目标</div>';
  const macroItems = [
    { label: '蛋白质', actual: avg.protein, target: macros.protein, unit: 'g' },
    { label: '碳水', actual: avg.carbs, target: macros.carbs, unit: 'g' },
    { label: '脂肪', actual: avg.fat, target: macros.fat, unit: 'g' },
    { label: '膳食纤维', actual: avg.fiber, target: macros.fiber, unit: 'g' },
    { label: '钠', actual: avg.sodium, target: macros.sodium, unit: 'mg' },
    { label: '饱和脂肪', actual: avg.saturatedFat, target: macros.saturatedFat, unit: 'g' },
    { label: '糖', actual: avg.sugar, target: macros.sugar, unit: 'g' }
  ];
  for (const m of macroItems) {
    const pct = Math.min((m.actual / Math.max(m.target, 1)) * 100, 100);
    const over = m.actual > m.target;
    html += `<div class="chart-row">
      <div class="chart-label">${m.label}</div>
      <div class="chart-bar-wrap">
        <div class="chart-bar calories-actual" style="width:${pct}%;${over ? 'background:#d94a4a;' : ''}">${m.actual}${m.unit}</div>
        <div class="chart-bar calories-target" style="width:${pct <= 100 ? 100 : (m.target / m.actual * 100)}%"></div>
      </div>
      <span style="font-size:10px;color:var(--text-secondary);margin-left:8px;">/${m.target}${m.unit}</span>
    </div>`;
  }
  html += '</div>';

  // 周营养素缺口卡片
  html += '<div class="analysis-cards" style="margin-top:12px;">';
  html += macroDeficitCard('蛋白质', avg.protein, macros.protein, 'g');
  html += macroDeficitCard('碳水', avg.carbs, macros.carbs, 'g');
  html += macroDeficitCard('脂肪', avg.fat, macros.fat, 'g');
  html += macroDeficitCard('膳食纤维', avg.fiber, macros.fiber, 'g');
  html += macroDeficitCard('钠', avg.sodium, macros.sodium, 'mg');
  html += macroDeficitCard('饱和脂肪', avg.saturatedFat, macros.saturatedFat, 'g');
  html += macroDeficitCard('糖', avg.sugar, macros.sugar, 'g');
  html += '</div>';

  document.getElementById('analysis-content').innerHTML = html;
}

function renderMonthAnalysis(targetCal) {
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  let monthTotal = 0;
  let daysTracked = 0;

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const { calories } = getEffectiveDayNutritionByDate(dateStr);
    monthTotal += calories;
    if (calories > 0) daysTracked++;
  }

  const monthTarget = targetCal * daysInMonth;
  const avgDaily = daysTracked > 0 ? Math.round(monthTotal / daysTracked) : 0;
  const deficit = targetCal * daysInMonth - monthTotal;
  const estimatedWeightChange = deficit > 0 ? (deficit / 7700).toFixed(1) : (Math.abs(deficit) / 7700).toFixed(1);

  document.getElementById('analysis-content').innerHTML = `
    <div class="analysis-cards">
      <div class="analysis-card"><div class="analysis-value">${fmtKcal(monthTotal)}</div><div class="analysis-label">本月摄入 (${calUnit()})</div></div>
      <div class="analysis-card"><div class="analysis-value">${fmtKcal(monthTarget)}</div><div class="analysis-label">本月目标 (${calUnit()})</div></div>
      <div class="analysis-card ${deficit > 100 ? 'deficit' : deficit < -100 ? 'surplus' : 'neutral'}"><div class="analysis-value">${deficit > 0 ? '-' : '+'}${fmtKcal(Math.abs(deficit))}</div><div class="analysis-label">月热量${deficit > 0 ? '缺口' : '盈余'} (${calUnit()})</div></div>
      <div class="analysis-card"><div class="analysis-value">${fmtKcal(avgDaily)}</div><div class="analysis-label">日均摄入 (${calUnit()})</div></div>
    </div>
    <div class="analysis-chart-wrap">
      <div class="analysis-chart-title">月度概览</div>
      <p style="font-size:14px;color:var(--text-secondary);">
        📅 本月已追踪 <strong>${daysTracked}</strong> / ${daysInMonth} 天<br>
        ⚖️ 估算体重变化：<strong>${deficit > 0 ? '减少' : '增加'} ~${estimatedWeightChange} kg</strong>（按 7700 ${calUnit()} ≈ 1kg 估算）
      </p>
    </div>
  `;
}

// ============ 渲染：食材清单 ============

function renderShoppingList() {
  const items = aggregateShoppingList(currentWeekStart);
  const listEl = document.getElementById('shopping-list');
  const emptyEl = document.getElementById('shopping-empty');
  const statsEl = document.getElementById('shopping-stats');

  if (items.length === 0) {
    listEl.innerHTML = '';
    emptyEl.classList.remove('hidden');
    statsEl.textContent = '';
    return;
  }
  emptyEl.classList.add('hidden');

  let checkedCount = 0;
  const ck = currentWeekStart;

  listEl.innerHTML = items.map(item => {
    const itemKey = `${item.ingredientId}_${item.display}`;
    const isChecked = shoppingChecked[ck]?.[itemKey];
    if (isChecked) checkedCount++;
    return `<li class="${isChecked ? 'checked' : ''}" data-shop="${itemKey}">
      <div class="shop-checkbox">${isChecked ? '✓' : ''}</div>
      <span class="shop-name">${item.name}</span>
      <span class="shop-amount">${item.display}</span>
    </li>`;
  }).join('');
  statsEl.textContent = `已勾选 ${checkedCount} / ${items.length} 项`;
}

// ============ 渲染：菜品库 ============

function renderDishLibrary(filterText = '', filterCategory = '全部') {
  let dishes = getAllDishes();
  const isBuiltin = (d) => buildPresetDishes().some(p => p.id === d.id);
  const isCustom = (d) => customDishes.some(c => c.id === d.id);

  if (filterCategory !== '全部') dishes = dishes.filter(d => d.category === filterCategory);
  if (filterText) {
    const q = filterText.toLowerCase();
    dishes = dishes.filter(d => d.name.toLowerCase().includes(q) || (d.category || '').toLowerCase().includes(q));
  }

  document.getElementById('dishes-grid').innerHTML = dishes.map(d => {
    const builtin = isBuiltin(d);
    const custom = isCustom(d);
    let cls = '';
    if (builtin) cls = 'builtin';
    else if (custom) cls = 'custom';
    const method = COOKING_METHODS.find(m => m.id === d.cookingMethodId);
    return `<div class="dish-card ${cls}" data-dish-id="${d.id}">
      <div class="dish-card-name">${d.name}</div>
      <div class="dish-card-category">${d.category}${method ? ' · ' + method.name : ''}</div>
      <div class="dish-card-nutrition">
        <span>热量 ${fmtKcal(d.calories)}${calUnit()}</span><span>蛋白 ${d.protein}g</span><span>碳水 ${d.carbs}g</span><span>脂肪 ${d.fat}g</span>
      </div>
      <div class="dish-card-actions">
        ${!builtin ? `<button class="btn btn-sm btn-edit-dish" data-dish-id="${d.id}">编辑</button>` : ''}
        ${!builtin ? `<button class="btn btn-sm btn-danger btn-delete-dish" data-dish-id="${d.id}">删除</button>` : ''}
      </div>
    </div>`;
  }).join('');
}

// ============ 渲染：食材库 ============

function renderIngredientLibrary(filterText = '', filterCategory = '全部') {
  let ings = getAllIngredients();

  if (filterCategory !== '全部') {
    ings = ings.filter(i => i.category === filterCategory);
  }
  if (filterText) {
    const q = filterText.toLowerCase();
    ings = ings.filter(i => i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q));
  }

  document.getElementById('ingredients-grid').innerHTML = ings.map(i => {
    const builtin = PRESET_INGREDIENTS.some(p => p.id === i.id);
    const cls = builtin ? 'builtin-ingredient' : 'custom-ingredient';
    return `<div class="ingredient-card ${cls}" data-ingredient-id="${i.id}">
      <div class="ingredient-card-name">${i.name}</div>
      <div class="ingredient-card-category">${i.category}</div>
      <div class="ingredient-card-nutrition">
        <span>热量 ${fmtKcal(i.calories)}${calUnit()}/100g</span><span>蛋白 ${i.protein}g</span><span>碳水 ${i.carbs}g</span><span>脂肪 ${i.fat}g</span><span>纤维 ${i.fiber || 0}g</span><span>钠 ${i.sodium || 0}mg</span>
      </div>
      <div class="ingredient-card-actions">
        ${!builtin ? `<button class="btn btn-sm btn-edit-ingredient" data-ingredient-id="${i.id}">编辑</button>` : ''}
        ${!builtin ? `<button class="btn btn-sm btn-danger btn-delete-ingredient" data-ingredient-id="${i.id}">删除</button>` : ''}
      </div>
    </div>`;
  }).join('');
}

async function searchIngredientOnline(query) {
  const statusEl = document.getElementById('ingredient-search-status');
  statusEl.classList.remove('hidden');
  statusEl.className = 'info';
  statusEl.textContent = '正在在线查找 "' + query + '" ...';

  if (window.location.protocol === 'file:') {
    statusEl.className = 'error';
    statusEl.innerHTML = '当前使用 <code>file://</code> 协议，浏览器不允许跨域请求。<br>请用终端执行 <code>cd "first CC" && python3 server.py</code><br>然后访问 <strong>http://localhost:8080</strong> 即可使用在线查找。';
    return;
  }

  // 搜索词列表：原词 + 英文翻译
  const queries = [query];
  const translated = INGREDIENT_TRANSLATIONS[query] || (query in INGREDIENT_TRANSLATIONS ? INGREDIENT_TRANSLATIONS[query] : null);
  if (translated && translated !== query) queries.push(translated);

  let allResults = [];

  for (const q of queries) {
    if (allResults.length >= 5) break;
    try {
      const url = `/api/search?q=${encodeURIComponent(q)}`;
      const resp = await fetch(url);
      if (!resp.ok) continue;
      const data = await resp.json();
      if (data.error) continue;
      if (!data.products || data.products.length === 0) continue;

      for (const p of data.products) {
        if (!p.nutriments || !p.product_name) continue;
        const n = p.nutriments;
        const name = p.product_name;
        if (allResults.some(f => f.name === name)) continue;
        allResults.push({
          name: name,
          calories: n['energy-kcal_100g'] || n['energy-kcal_value'] || 0,
          protein: n.proteins_100g || n.proteins_value || 0,
          carbs: n.carbohydrates_100g || n.carbohydrates_value || 0,
          fat: n.fat_100g || n.fat_value || 0
        });
        if (allResults.length >= 5) break;
      }
    } catch (e) {
      continue;
    }
  }

  if (allResults.length === 0) {
    statusEl.className = 'error';
    statusEl.textContent = '未找到相关食材，请尝试英文关键词或手动添加食材。';
    return;
  }

  statusEl.className = 'info';
  statusEl.innerHTML = `找到 ${allResults.length} 个结果，点击添加到食材库：<br>` +
    allResults.map(f => `<button class="btn btn-sm btn-primary" style="margin:4px;" data-online-add='${JSON.stringify(f).replace(/'/g, "&#39;")}'>${f.name} (${fmtKcal(f.calories)} ${calUnit()}/100g)</button>`).join('');
}

// ============ 渲染：菜品定制 ============

function renderDishCustomizer(filterText = '') {
  // Fill cooking method options
  const sel = document.getElementById('customizer-cooking-method');
  if (sel.options.length === 0) {
    sel.innerHTML = COOKING_METHODS.map(m => `<option value="${m.id}">${m.name} (×${m.multiplier}) - ${m.desc}</option>`).join('');
  }

  // Filter ingredients
  let ings = getAllIngredients();
  if (filterText) {
    const q = filterText.toLowerCase();
    ings = ings.filter(i => i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q));
  }

  document.getElementById('customizer-ingredient-list').innerHTML = ings.slice(0, 30).map(i => `
    <div class="customizer-ing-item" data-add-ing-id="${i.id}">
      <span class="cust-ing-name">${i.name}</span>
      <span class="cust-ing-nut">${fmtKcal(i.calories)} ${calUnit()}/100g · ${i.category}</span>
    </div>
  `).join('');

  updateCustomizerNutrition();
}

function updateCustomizerNutrition() {
  const selectedEls = document.querySelectorAll('.customizer-selected-item');
  const ingredients = [];
  selectedEls.forEach(el => {
    const ingId = el.dataset.ingId;
    const g = parseFloat(el.querySelector('input').value) || 0;
    if (g > 0) ingredients.push({ id: ingId, g });
  });
  const methodId = document.getElementById('customizer-cooking-method').value;
  const nutrition = calcDishNutritionFromIngredients(ingredients, methodId);
  document.getElementById('cust-cal').textContent = fmtKcal(nutrition.calories);
  document.getElementById('cust-protein').textContent = nutrition.protein;
  document.getElementById('cust-carbs').textContent = nutrition.carbs;
  document.getElementById('cust-fat').textContent = nutrition.fat;
  document.getElementById('cust-fiber').textContent = nutrition.fiber;
  document.getElementById('cust-sodium').textContent = nutrition.sodium;
  document.getElementById('cust-satfat').textContent = nutrition.saturatedFat;
  document.getElementById('cust-sugar').textContent = nutrition.sugar;
}

function addIngredientToCustomizer(ingId) {
  const selDiv = document.getElementById('customizer-selected');
  // Remove empty msg
  const emptyMsg = selDiv.querySelector('.customizer-empty-msg');
  if (emptyMsg) emptyMsg.remove();

  // Check if already added
  const existing = selDiv.querySelector(`[data-ing-id="${ingId}"]`);
  if (existing) {
    const input = existing.querySelector('input');
    input.value = (parseFloat(input.value) || 0) + 100;
    updateCustomizerNutrition();
    return;
  }

  const ing = getIngredientById(ingId);
  if (!ing) return;

  const div = document.createElement('div');
  div.className = 'customizer-selected-item';
  div.dataset.ingId = ingId;
  div.innerHTML = `
    <span class="cust-sel-name">${ing.name}</span>
    <input type="number" value="100" min="1" max="10000" step="10" data-ing-id="${ingId}">
    <span class="cust-sel-unit">g</span>
    <span style="font-size:11px;color:var(--text-secondary);">${fmtKcal(ing.calories)} ${calUnit()}/100g</span>
    <button class="btn btn-sm btn-danger btn-remove-cust-ing">×</button>
  `;
  selDiv.appendChild(div);
  updateCustomizerNutrition();
}

// ============ 菜品选择弹窗 ============

const ALL_CATEGORIES = ['全部', '家常菜', '粤菜', '川湘辣菜', '汤类', '主食', '早餐', '凉菜', '其他'];

let pickerDayIndex, pickerMealType, pickerIsActual;
let currentPickerCategory = '全部';

function openDishPicker(dayIndex, mealType, isActual = false) {
  pickerDayIndex = dayIndex; pickerMealType = mealType; pickerIsActual = isActual;
  const mealLabel = `${DAY_LABELS[dayIndex]} ${MEAL_LABELS[MEAL_TYPES.indexOf(mealType)]}`;
  const mode = isActual ? '【实际摄入】' : '';
  document.getElementById('picker-title').textContent = `选择菜品 ${mode}- ${mealLabel}`;
  document.getElementById('modal-picker').classList.remove('hidden');

  // 初始化标签为菜品模式
  switchPickerTab('dish');
  document.getElementById('picker-search').value = '';
  renderPickerCategories('全部');
  renderPickerList('', '全部');

  // 初始化快速组合模式
  document.getElementById('picker-quick-search').value = '';
  renderPickerQuickIngredients('');
  // 清空已选食材
  document.getElementById('picker-quick-selected').innerHTML = '<div class="picker-quick-empty">点击上方食材添加，设置克数后确认</div>';
  // 填充烹饪方式
  const pqMethod = document.getElementById('picker-quick-method');
  if (pqMethod.options.length === 0) {
    pqMethod.innerHTML = COOKING_METHODS.map(m => `<option value="${m.id}">${m.name}（${m.desc}）</option>`).join('');
  }
  pqMethod.value = 'cm_stir_fry';
  updatePickerQuickNutrition();

  pickerCallback = (dishId) => {
    if (dishId) {
      if (isActual) {
        setActualMeal(currentWeekStart, dayIndex, mealType, dishId);
      } else {
        setMeal(currentWeekStart, dayIndex, mealType, dishId);
      }
      // 不关闭，允许连续多选；刷新列表更新选中状态
      renderMealPlanner();
      renderPickerList(document.getElementById('picker-search').value, currentPickerCategory);
    } else {
      // 清空该餐所有菜品
      const plan = isActual ? getActualMealPlan(currentWeekStart) : getMealPlan(currentWeekStart);
      plan.days[dayIndex][mealType] = [];
      saveData();
      renderMealPlanner();
      closeDishPicker();
    }
  };
}

function closeDishPicker() {
  document.getElementById('modal-picker').classList.add('hidden');
  pickerCallback = null;
}

// ============ 运动设置弹窗 ============

let exercisePickerDayIndex = null;

function openExercisePicker(dayIndex) {
  exercisePickerDayIndex = dayIndex;
  const dayLabel = DAY_LABELS[dayIndex];
  document.getElementById('exercise-picker-title').textContent = `设置 ${dayLabel} 运动`;
  renderExercisePresets();
  document.getElementById('exercise-custom-wrapper').classList.add('hidden');
  document.getElementById('modal-exercise').classList.remove('hidden');
}

function closeExercisePicker() {
  document.getElementById('modal-exercise').classList.add('hidden');
  exercisePickerDayIndex = null;
}

function renderExercisePresets() {
  const list = document.getElementById('exercise-preset-list');
  const ws = currentWeekStart;
  const di = exercisePickerDayIndex;
  const currentInfo = di !== null ? getDayExerciseInfo(ws, di) : null;
  const currentPreset = currentInfo ? currentInfo.preset : null;

  list.innerHTML = EXERCISE_PRESETS.map(p => {
    const isActive = currentPreset === p.id;
    let kcal = 0;
    if (p.met !== null && p.met > 0 && currentUser) {
      kcal = Math.round(p.met * currentUser.weight * p.duration);
    } else if (p.id === 'custom_kcal' && currentInfo) {
      kcal = currentInfo.calories || 0;
    }
    const kcalText = p.id === 'rest' ? '' : (p.id === 'custom_kcal' ? ' (自定义)' : ` ≈${fmtKcal(kcal)} ${calUnit()}`);
    return `<div class="exercise-preset-item ${isActive ? 'active' : ''}" data-ex-preset="${p.id}">
      <span class="ex-preset-name">${p.name}</span>
      <span class="ex-preset-kcal">${kcalText}</span>
    </div>`;
  }).join('');
}

function selectExercisePreset(presetId) {
  const di = exercisePickerDayIndex;
  if (di === null) return;
  const ws = currentWeekStart;

  if (presetId === 'rest') {
    setDayExercise(ws, di, 'rest', 0);
    closeExercisePicker();
    renderMealPlanner();
    return;
  }

  if (presetId === 'custom_kcal') {
    document.getElementById('exercise-custom-wrapper').classList.remove('hidden');
    document.getElementById('exercise-custom-kcal').focus();
    return;
  }

  const preset = EXERCISE_PRESETS.find(p => p.id === presetId);
  if (preset && currentUser) {
    const kcal = Math.round(preset.met * currentUser.weight * preset.duration);
    setDayExercise(ws, di, presetId, kcal);
  }
  closeExercisePicker();
  renderMealPlanner();
}

function confirmExerciseCustom() {
  const di = exercisePickerDayIndex;
  if (di === null) return;
  const ws = currentWeekStart;
  const kcal = parseInt(document.getElementById('exercise-custom-kcal').value) || 0;
  setDayExercise(ws, di, 'custom_kcal', kcal);
  closeExercisePicker();
  renderMealPlanner();
}

// ============ 选择器标签切换 ============
function switchPickerTab(tab) {
  document.querySelectorAll('.picker-tab').forEach(t => t.classList.toggle('active', t.dataset.pickerTab === tab));
  document.getElementById('picker-dish-mode').classList.toggle('hidden', tab !== 'dish');
  document.getElementById('picker-quick-mode').classList.toggle('hidden', tab !== 'quick');
  document.getElementById('btn-clear-meal').classList.toggle('hidden', tab !== 'dish');
  document.getElementById('btn-quick-confirm').classList.toggle('hidden', tab !== 'quick');
}

// ============ 快速组合：食材搜索列表 ============
function renderPickerQuickIngredients(filterText) {
  let ings = getAllIngredients();
  if (filterText) {
    const q = filterText.toLowerCase();
    ings = ings.filter(i => i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q));
  }
  document.getElementById('picker-quick-ingredients').innerHTML = ings.slice(0, 25).map(i => `
    <div class="picker-quick-ing-item" data-pq-add="${i.id}">
      <span class="pq-ing-name">${i.name}</span>
      <span class="pq-ing-nut">${fmtKcal(i.calories)} ${calUnit()}/100g · ${i.category}</span>
    </div>
  `).join('');
}

// ============ 快速组合：添加食材到已选列表 ============
function addIngredientToPickerQuick(ingId) {
  const selDiv = document.getElementById('picker-quick-selected');
  const emptyEl = selDiv.querySelector('.picker-quick-empty');
  if (emptyEl) emptyEl.remove();

  // 已存在则增加克数
  const existing = selDiv.querySelector(`[data-pq-ing-id="${ingId}"]`);
  if (existing) {
    const input = existing.querySelector('input');
    input.value = (parseFloat(input.value) || 0) + 50;
    input.dispatchEvent(new Event('input'));
    return;
  }

  const ing = getIngredientById(ingId);
  if (!ing) return;

  const div = document.createElement('div');
  div.className = 'picker-quick-sel-item';
  div.dataset.pqIngId = ingId;
  div.innerHTML = `
    <span class="pq-sel-name">${ing.name}</span>
    <input type="number" value="100" min="1" max="10000" step="10" data-pq-ing-id="${ingId}">
    <span class="pq-sel-unit">g</span>
    <span class="pq-sel-kcal">${fmtKcal(ing.calories)} ${calUnit()}</span>
    <button class="btn btn-sm btn-danger btn-pq-remove">×</button>
  `;
  selDiv.appendChild(div);
  updatePickerQuickNutrition();
}

// ============ 快速组合：更新营养计算 ============
function updatePickerQuickNutrition() {
  const methodId = document.getElementById('picker-quick-method').value;
  const items = document.querySelectorAll('.picker-quick-sel-item');
  const ingredients = [];
  items.forEach(el => {
    const ingId = el.dataset.pqIngId;
    const g = parseFloat(el.querySelector('input').value) || 0;
    if (g > 0) ingredients.push({ id: ingId, g });
  });
  const nutrition = calcDishNutritionFromIngredients(ingredients, methodId);
  document.getElementById('pq-cal').textContent = fmtKcal(nutrition.calories);
  document.getElementById('pq-protein').textContent = nutrition.protein;
  document.getElementById('pq-carbs').textContent = nutrition.carbs;
  document.getElementById('pq-fat').textContent = nutrition.fat;
  document.getElementById('pq-fiber').textContent = nutrition.fiber;
  document.getElementById('pq-sodium').textContent = nutrition.sodium;
  document.getElementById('pq-satfat').textContent = nutrition.saturatedFat;
  document.getElementById('pq-sugar').textContent = nutrition.sugar;

  // 更新单项食材的 kcal 显示
  items.forEach(el => {
    const ingId = el.dataset.pqIngId;
    const g = parseFloat(el.querySelector('input').value) || 0;
    const ing = getIngredientById(ingId);
    const kcalEl = el.querySelector('.pq-sel-kcal');
    if (ing && kcalEl) {
      const method = COOKING_METHODS.find(m => m.id === methodId);
      const mult = method ? method.multiplier : 1.0;
      kcalEl.textContent = fmtCal(Math.round(ing.calories * (g / 100) * mult));
    }
  });
}

// ============ 快速组合：确认并保存 ============
function confirmPickerQuick() {
  const items = document.querySelectorAll('.picker-quick-sel-item');
  const ingredients = [];
  items.forEach(el => {
    const ingId = el.dataset.pqIngId;
    const g = parseFloat(el.querySelector('input').value) || 0;
    if (g > 0) ingredients.push({ id: ingId, g });
  });
  if (ingredients.length === 0) return;

  const methodId = document.getElementById('picker-quick-method').value;
  const nutrition = calcDishNutritionFromIngredients(ingredients, methodId);

  // 生成菜品名称
  const nameParts = ingredients.slice(0, 3).map(item => {
    const ing = getIngredientById(item.id);
    return ing ? ing.name : item.id;
  });
  const method = COOKING_METHODS.find(m => m.id === methodId);
  const dishName = method.name + ' ' + nameParts.join('+') + (ingredients.length > 3 ? '等' : '');

  // 创建临时自定义菜品
  const dishId = 'quick_' + Date.now();
  const dish = {
    id: dishId,
    name: dishName,
    category: '其他',
    cookingMethodId: methodId,
    ingredients: ingredients,
    calories: nutrition.calories,
    protein: nutrition.protein,
    carbs: nutrition.carbs,
    fat: nutrition.fat,
    sodium: nutrition.sodium,
    fiber: nutrition.fiber,
    saturatedFat: nutrition.saturatedFat,
    sugar: nutrition.sugar,
    isCustom: true,
    isQuick: true
  };
  customDishes.push(dish);
  saveData();

  if (pickerCallback) pickerCallback(dishId);
}

function renderPickerCategories(activeCat) {
  currentPickerCategory = activeCat;
  document.getElementById('picker-categories').innerHTML = ALL_CATEGORIES.map(c =>
    `<button class="picker-cat-btn ${c === activeCat ? 'active' : ''}" data-picker-cat="${c}">${c}</button>`
  ).join('');
}

function renderPickerList(filterText, filterCategory) {
  let dishes = getAllDishes();
  if (filterCategory !== '全部') dishes = dishes.filter(d => d.category === filterCategory);
  if (filterText) {
    const q = filterText.toLowerCase();
    dishes = dishes.filter(d => d.name.toLowerCase().includes(q));
  }
  // 获取当前槽位已选菜品
  const plan = pickerIsActual ? getActualMealPlan(currentWeekStart) : getMealPlan(currentWeekStart);
  const selected = (pickerDayIndex !== undefined) ? (plan.days[pickerDayIndex]?.[pickerMealType] || []) : [];
  const selectedSet = new Set(Array.isArray(selected) ? selected : (selected ? [selected] : []));

  document.getElementById('picker-list').innerHTML = dishes.map(d => `
    <div class="picker-item${selectedSet.has(d.id) ? ' picker-item-selected' : ''}" data-pick-dish-id="${d.id}">
      <span class="picker-item-name">${selectedSet.has(d.id) ? '✓ ' : ''}${d.name} <small style="color:var(--text-secondary)">${d.category}</small></span>
      <span class="picker-item-nutrition">${fmtCal(d.calories)} | 蛋白${d.protein}g | 碳水${d.carbs}g | 脂肪${d.fat}g</span>
    </div>
  `).join('');
}

// ============ 菜品编辑弹窗 ============

function openDishForm(dishId) {
  const modal = document.getElementById('modal-dish-form');
  const title = document.getElementById('dish-form-title');
  // Fill cooking methods
  const cmSel = document.getElementById('dish-cooking-method');
  if (cmSel.options.length === 0) {
    cmSel.innerHTML = COOKING_METHODS.map(m => `<option value="${m.id}">${m.name}</option>`).join('');
  }

  if (dishId) {
    const dish = getDishById(dishId);
    if (!dish) return;
    title.textContent = '编辑菜品';
    document.getElementById('dish-id').value = dish.id;
    document.getElementById('dish-name').value = dish.name;
    document.getElementById('dish-category').value = dish.category;
    document.getElementById('dish-cooking-method').value = dish.cookingMethodId || 'cm_stir_fry';
    document.getElementById('dish-calories').value = dish.calories;
    document.getElementById('dish-protein').value = dish.protein;
    document.getElementById('dish-carbs').value = dish.carbs;
    document.getElementById('dish-fat').value = dish.fat;
    document.getElementById('dish-sodium').value = dish.sodium || 0;
    document.getElementById('dish-fiber').value = dish.fiber || 0;
    document.getElementById('dish-satfat').value = dish.saturatedFat || 0;
    document.getElementById('dish-sugar').value = dish.sugar || 0;
    // Convert ingredients array to text
    const ingText = (dish.ingredients || []).map(item => {
      const ing = getIngredientById(item.id);
      return ing ? `${ing.name} ${item.g}` : `${item.id} ${item.g}`;
    }).join('\n');
    document.getElementById('dish-ingredients').value = ingText;
  } else {
    title.textContent = '添加菜品';
    document.getElementById('dish-id').value = '';
    document.getElementById('dish-name').value = '';
    document.getElementById('dish-category').value = '家常菜';
    document.getElementById('dish-cooking-method').value = 'cm_stir_fry';
    document.getElementById('dish-calories').value = '';
    document.getElementById('dish-protein').value = '';
    document.getElementById('dish-carbs').value = '';
    document.getElementById('dish-fat').value = '';
    document.getElementById('dish-sodium').value = '';
    document.getElementById('dish-fiber').value = '';
    document.getElementById('dish-satfat').value = '';
    document.getElementById('dish-sugar').value = '';
    document.getElementById('dish-ingredients').value = '';
  }
  modal.classList.remove('hidden');
}

function closeDishForm() {
  document.getElementById('modal-dish-form').classList.add('hidden');
}

// ============ 食材编辑弹窗 ============

function openIngredientForm(ingId) {
  const modal = document.getElementById('modal-ingredient-form');
  const title = document.getElementById('ingredient-form-title');

  if (ingId) {
    const ing = getIngredientById(ingId);
    if (!ing) return;
    title.textContent = '编辑食材';
    document.getElementById('ingredient-id').value = ing.id;
    document.getElementById('ingredient-name').value = ing.name;
    document.getElementById('ingredient-category').value = ing.category;
    document.getElementById('ingredient-calories').value = ing.calories;
    document.getElementById('ingredient-protein').value = ing.protein;
    document.getElementById('ingredient-carbs').value = ing.carbs;
    document.getElementById('ingredient-fat').value = ing.fat;
    document.getElementById('ingredient-sodium').value = ing.sodium || 0;
    document.getElementById('ingredient-fiber').value = ing.fiber || 0;
    document.getElementById('ingredient-satfat').value = ing.saturatedFat || 0;
    document.getElementById('ingredient-sugar').value = ing.sugar || 0;
  } else {
    title.textContent = '添加食材';
    document.getElementById('ingredient-id').value = '';
    document.getElementById('ingredient-name').value = '';
    document.getElementById('ingredient-category').value = '蔬菜';
    document.getElementById('ingredient-calories').value = '';
    document.getElementById('ingredient-protein').value = '';
    document.getElementById('ingredient-carbs').value = '';
    document.getElementById('ingredient-fat').value = '';
    document.getElementById('ingredient-sodium').value = '';
    document.getElementById('ingredient-fiber').value = '';
    document.getElementById('ingredient-satfat').value = '';
    document.getElementById('ingredient-sugar').value = '';
  }
  modal.classList.remove('hidden');
}

function closeIngredientForm() {
  document.getElementById('modal-ingredient-form').classList.add('hidden');
}

// ============ 事件处理 ============

document.addEventListener('click', function (e) {
  const target = e.target;

  // 侧边栏导航
  if (target.classList.contains('nav-item') || target.closest('.nav-item')) {
    const btn = target.classList.contains('nav-item') ? target : target.closest('.nav-item');
    switchNav(btn.dataset.nav);
    return;
  }

  // 移动端菜单
  if (target.id === 'menu-toggle' || target.closest('#menu-toggle')) {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('sidebar-overlay').classList.toggle('hidden');
    return;
  }
  if (target.id === 'sidebar-overlay') {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebar-overlay').classList.add('hidden');
    return;
  }

  // 热量单位切换
  if (target.classList.contains('unit-btn')) {
    calorieUnit = target.dataset.unit;
    document.querySelectorAll('.unit-btn').forEach(b => b.classList.toggle('active', b.dataset.unit === calorieUnit));
    saveData();
    renderActivePanel();
    return;
  }

  // 周导航：切换到空白周时自动复制当前周菜单
  if (target.id === 'btn-prev-week' || target.id === 'btn-next-week' || target.id === 'btn-this-week') {
    const oldWeek = currentWeekStart;
    if (target.id === 'btn-prev-week') {
      currentWeekStart = shiftWeek(currentWeekStart, -1);
    } else if (target.id === 'btn-next-week') {
      currentWeekStart = shiftWeek(currentWeekStart, 1);
    } else {
      currentWeekStart = getMonday(new Date());
    }
    // 目标周为空且与当前周不同，从旧周复制
    if (oldWeek !== currentWeekStart && !mealPlans[currentWeekStart]) {
      const oldPlan = mealPlans[oldWeek];
      if (oldPlan) {
        mealPlans[currentWeekStart] = JSON.parse(JSON.stringify(oldPlan));
      }
    }
    renderMealPlanner(); return;
  }

  // 记录实际摄入
  if (target.classList.contains('btn-actual-meal') || target.closest('.btn-actual-meal')) {
    const btn = target.classList.contains('btn-actual-meal') ? target : target.closest('.btn-actual-meal');
    const slot = btn.closest('.meal-slot');
    openDishPicker(parseInt(slot.dataset.day), slot.dataset.meal, true);
    return;
  }
  // 菜单格子 → 设置计划摄入
  if (target.closest('.meal-slot')) {
    const slot = target.closest('.meal-slot');
    openDishPicker(parseInt(slot.dataset.day), slot.dataset.meal, false);
    return;
  }

  // 用户相关
  if (target.id === 'btn-show-add-user') { showUserForm(null); return; }
  if (target.id === 'btn-cancel-user') { document.getElementById('user-form-wrap').classList.add('hidden'); return; }
  if (target.classList.contains('btn-edit-user') || target.closest('.btn-edit-user')) {
    const btn = target.classList.contains('btn-edit-user') ? target : target.closest('.btn-edit-user');
    const u = users.find(u => u.id === btn.dataset.userId);
    if (u) showUserForm(u);
    return;
  }
  if (target.classList.contains('btn-delete-user') || target.closest('.btn-delete-user')) {
    const btn = target.classList.contains('btn-delete-user') ? target : target.closest('.btn-delete-user');
    if (confirm('确定删除此用户吗？')) {
      const uid = btn.dataset.userId;
      users = users.filter(u => u.id !== uid);
      if (currentUser && currentUser.id === uid) currentUser = users.length > 0 ? users[0] : null;
      saveData(); renderUsers();
    }
    return;
  }
  if (target.closest('.user-card') && !target.closest('button')) {
    const card = target.closest('.user-card');
    const u = users.find(u => u.id === card.dataset.userId);
    if (u) { currentUser = u; saveData(); renderUsers(); }
    return;
  }

  // 热量分析
  if (target.classList.contains('analysis-view-btn')) {
    renderCalorieAnalysis(target.dataset.analysisView);
    return;
  }
  if (target.id === 'analysis-day-picker') {
    // Will handle on change
    return;
  }

  // 食材清单
  if (target.closest('.shopping-list li')) {
    const li = target.closest('.shopping-list li');
    const itemKey = li.dataset.shop;
    const ck = currentWeekStart;
    if (!shoppingChecked[ck]) shoppingChecked[ck] = {};
    shoppingChecked[ck][itemKey] = !shoppingChecked[ck][itemKey];
    saveData(); renderShoppingList();
    return;
  }
  if (target.id === 'btn-reset-shopping') {
    shoppingChecked[currentWeekStart] = {};
    saveData(); renderShoppingList();
    return;
  }

  // 菜品库
  if (target.id === 'btn-add-dish') { openDishForm(null); return; }
  if (target.id === 'btn-open-customizer') { switchNav('customizer'); return; }
  if (target.id === 'btn-open-ingredients') { switchNav('ingredients'); return; }
  if (target.classList.contains('btn-edit-dish') || target.closest('.btn-edit-dish')) {
    const btn = target.classList.contains('btn-edit-dish') ? target : target.closest('.btn-edit-dish');
    openDishForm(btn.dataset.dishId);
    return;
  }
  if (target.classList.contains('btn-delete-dish') || target.closest('.btn-delete-dish')) {
    const btn = target.classList.contains('btn-delete-dish') ? target : target.closest('.btn-delete-dish');
    if (confirm('确定删除吗？')) {
      customDishes = customDishes.filter(d => d.id !== btn.dataset.dishId);
      for (const wk of Object.keys(mealPlans)) {
        for (const dd of [0, 1, 2, 3, 4, 5, 6]) {
          if (!mealPlans[wk].days[dd]) continue;
          for (const mt of MEAL_TYPES) {
            const slot = mealPlans[wk].days[dd][mt];
            if (Array.isArray(slot)) {
              mealPlans[wk].days[dd][mt] = slot.filter(id => id !== btn.dataset.dishId);
            } else if (slot === btn.dataset.dishId) {
              mealPlans[wk].days[dd][mt] = [];
            }
          }
        }
      }
      saveData(); renderDishLibrary(); renderMealPlanner();
    }
    return;
  }

  // 食材库
  if (target.id === 'btn-add-ingredient') { openIngredientForm(null); return; }
  if (target.id === 'btn-search-online') {
    const q = document.getElementById('ingredient-search').value.trim();
    if (q) searchIngredientOnline(q);
    return;
  }
  if (target.classList.contains('btn-edit-ingredient') || target.closest('.btn-edit-ingredient')) {
    const btn = target.classList.contains('btn-edit-ingredient') ? target : target.closest('.btn-edit-ingredient');
    openIngredientForm(btn.dataset.ingredientId);
    return;
  }
  if (target.classList.contains('btn-delete-ingredient') || target.closest('.btn-delete-ingredient')) {
    const btn = target.classList.contains('btn-delete-ingredient') ? target : target.closest('.btn-delete-ingredient');
    if (confirm('确定删除此食材吗？')) {
      customIngredients = customIngredients.filter(i => i.id !== btn.dataset.ingredientId);
      saveData(); renderIngredientLibrary();
    }
    return;
  }
  if (target.dataset.onlineAdd) {
    try {
      const f = JSON.parse(target.dataset.onlineAdd);
      openIngredientForm(null);
      document.getElementById('ingredient-name').value = f.name;
      document.getElementById('ingredient-calories').value = f.calories;
      document.getElementById('ingredient-protein').value = f.protein;
      document.getElementById('ingredient-carbs').value = f.carbs;
      document.getElementById('ingredient-fat').value = f.fat;
      document.getElementById('ingredient-sodium').value = f.sodium || 0;
      document.getElementById('ingredient-fiber').value = f.fiber || 0;
      document.getElementById('ingredient-satfat').value = f.saturatedFat || 0;
      document.getElementById('ingredient-sugar').value = f.sugar || 0;
      document.getElementById('ingredient-category').value = '自定义';
      document.getElementById('ingredient-search-status').classList.add('hidden');
    } catch (ex) { /* ignore */ }
    return;
  }

  // 菜品定制
  if (target.closest('.customizer-ing-item')) {
    const item = target.closest('.customizer-ing-item');
    addIngredientToCustomizer(item.dataset.addIngId);
    return;
  }
  if (target.classList.contains('btn-remove-cust-ing') || target.closest('.btn-remove-cust-ing')) {
    const item = target.closest('.customizer-selected-item');
    if (item) { item.remove(); updateCustomizerNutrition(); }
    // Show empty msg if no items
    const selDiv = document.getElementById('customizer-selected');
    if (selDiv.querySelectorAll('.customizer-selected-item').length === 0) {
      selDiv.innerHTML = '<div class="customizer-empty-msg">从左侧搜索并添加食材</div>';
    }
    return;
  }
  if (target.id === 'btn-save-custom-dish') {
    const name = document.getElementById('customizer-dish-name').value.trim();
    if (!name) { alert('请输入菜品名称'); return; }
    const selectedEls = document.querySelectorAll('.customizer-selected-item');
    const ingredients = [];
    selectedEls.forEach(el => {
      const g = parseFloat(el.querySelector('input').value) || 0;
      if (g > 0) ingredients.push({ id: el.dataset.ingId, g });
    });
    if (ingredients.length === 0) { alert('请至少添加一种食材'); return; }
    const methodId = document.getElementById('customizer-cooking-method').value;
    const nutrition = calcDishNutritionFromIngredients(ingredients, methodId);
    const newDish = {
      id: generateId('cd_'),
      name, category: '自定义', cookingMethodId: methodId,
      calories: nutrition.calories, protein: nutrition.protein, carbs: nutrition.carbs, fat: nutrition.fat,
      sodium: nutrition.sodium, fiber: nutrition.fiber, saturatedFat: nutrition.saturatedFat, sugar: nutrition.sugar,
      ingredients, isBuiltin: false, isCustom: true, userId: currentUser ? currentUser.id : null
    };
    customDishes.push(newDish);
    saveData();
    alert(`菜品"${name}"已保存到菜品库！`);
    // Reset
    document.getElementById('customizer-dish-name').value = '';
    document.getElementById('customizer-selected').innerHTML = '<div class="customizer-empty-msg">从左侧搜索并添加食材</div>';
    updateCustomizerNutrition();
    return;
  }

  // 菜品选择器
  if (target.dataset.pickerTab) {
    switchPickerTab(target.dataset.pickerTab);
    return;
  }
  if (target.dataset.pickerCat) {
    renderPickerCategories(target.dataset.pickerCat);
    renderPickerList(document.getElementById('picker-search').value, target.dataset.pickerCat);
    return;
  }
  if (target.closest('.picker-item')) {
    const dishId = target.closest('.picker-item').dataset.pickDishId;
    if (pickerCallback) pickerCallback(dishId);
    return;
  }
  if (target.id === 'btn-close-picker') { closeDishPicker(); return; }
  if (target.id === 'modal-picker') { closeDishPicker(); return; }
  if (target.id === 'btn-clear-meal') { if (pickerCallback) pickerCallback(null); return; }

  // 快速组合
  if (target.closest('.picker-quick-ing-item')) {
    addIngredientToPickerQuick(target.closest('.picker-quick-ing-item').dataset.pqAdd);
    return;
  }
  if (target.classList.contains('btn-pq-remove') || target.closest('.btn-pq-remove')) {
    const item = target.closest('.picker-quick-sel-item');
    if (item) { item.remove(); updatePickerQuickNutrition(); }
    const selDiv = document.getElementById('picker-quick-selected');
    if (selDiv.querySelectorAll('.picker-quick-sel-item').length === 0) {
      selDiv.innerHTML = '<div class="picker-quick-empty">点击上方食材添加，设置克数后确认</div>';
    }
    return;
  }
  if (target.id === 'btn-quick-confirm') { confirmPickerQuick(); return; }

  // 运动设置
  if (target.closest('.meal-exercise-cell')) {
    const dayIdx = parseInt(target.closest('.meal-exercise-cell').dataset.exDay);
    openExercisePicker(dayIdx);
    return;
  }
  if (target.closest('.exercise-preset-item')) {
    selectExercisePreset(target.closest('.exercise-preset-item').dataset.exPreset);
    return;
  }
  if (target.id === 'btn-close-exercise' || target.id === 'modal-exercise') {
    closeExercisePicker(); return;
  }
  if (target.id === 'btn-clear-exercise') { selectExercisePreset('rest'); return; }
  if (target.id === 'exercise-custom-kcal') {
    // 回车确认自定义 kcal
    target.addEventListener('keydown', function handler(e) {
      if (e.key === 'Enter') { confirmExerciseCustom(); target.removeEventListener('keydown', handler); }
    });
    return;
  }

  // 菜品编辑弹窗
  if (target.id === 'btn-close-dish-form' || target.id === 'btn-cancel-dish' || target.id === 'modal-dish-form') {
    closeDishForm(); return;
  }

  // 食材编辑弹窗
  if (target.id === 'btn-close-ingredient-form' || target.id === 'btn-cancel-ingredient' || target.id === 'modal-ingredient-form') {
    closeIngredientForm(); return;
  }

  // 体重追踪
  if (target.id === 'btn-add-weight') {
    const date = document.getElementById('weight-date').value;
    const weight = parseFloat(document.getElementById('weight-value').value);
    if (date && weight > 0) {
      // Replace existing date entry if exists
      const idx = weightLogs.findIndex(w => w.date === date);
      if (idx >= 0) weightLogs[idx].weight = weight;
      else weightLogs.push({ date, weight });
      weightLogs.sort((a, b) => a.date.localeCompare(b.date));
      saveData();
      renderWeightSection();
      // Update current user weight to latest
      if (currentUser) {
        currentUser.weight = weight;
        saveData();
        renderUsers();
      }
    }
    return;
  }
  // 数据导出
  if (target.id === 'btn-export-data') {
    exportData(); return;
  }
});

// 搜索过滤
document.addEventListener('input', function (e) {
  const t = e.target;
  if (t.id === 'picker-search') {
    renderPickerList(t.value, document.querySelector('.picker-cat-btn.active')?.dataset.pickerCat || '全部');
  }
  if (t.id === 'dish-search') {
    renderDishLibrary(t.value, document.getElementById('dish-category-filter').value);
  }
  if (t.id === 'ingredient-search') {
    renderIngredientLibrary(t.value, document.getElementById('ingredient-category-filter').value);
  }
  if (t.id === 'customizer-search') {
    renderDishCustomizer(t.value);
  }
  if (t.id === 'picker-quick-search') {
    renderPickerQuickIngredients(t.value);
  }
  // 快速组合克数变化
  if (t.dataset.pqIngId) {
    updatePickerQuickNutrition();
  }
});

// 搜索变化（select/datalist）
document.addEventListener('change', function (e) {
  const t = e.target;
  if (t.id === 'dish-category-filter') {
    renderDishLibrary(document.getElementById('dish-search').value, t.value);
  }
  if (t.id === 'ingredient-category-filter') {
    renderIngredientLibrary(document.getElementById('ingredient-search').value, t.value);
  }
  if (t.id === 'analysis-day-picker') {
    if (currentUser) {
      document.getElementById('analysis-day-picker').value = t.value;
      renderDayAnalysis(calcTargetCalories(currentUser));
    }
  }
  if (t.id === 'customizer-cooking-method') {
    updateCustomizerNutrition();
  }
  if (t.id === 'picker-quick-method') {
    updatePickerQuickNutrition();
  }
  // Live update customizer nutrition when gram inputs change
  if (t.dataset.ingId && t.closest('.customizer-selected-item')) {
    updateCustomizerNutrition();
  }
  // Live update quick-combine nutrition when gram inputs change
  if (t.dataset.pqIngId) {
    updatePickerQuickNutrition();
  }
});

// 表单提交
let pendingUserData = null;

document.getElementById('user-form').addEventListener('submit', function (e) {
  e.preventDefault();
  try {
    const id = document.getElementById('user-id').value;
    const targetDate = document.getElementById('user-target-date').value;
    const bodyFatEl = document.getElementById('user-bodyfat');
    const targetBodyFatEl = document.getElementById('user-target-bodyfat');
    const userData = {
      id: id || generateId('u_'),
      name: document.getElementById('user-name').value.trim(),
      age: parseInt(document.getElementById('user-age').value) || 30,
      gender: document.getElementById('user-gender').value,
      height: parseFloat(document.getElementById('user-height').value) || 170,
      weight: parseFloat(document.getElementById('user-weight').value) || 65,
      bodyFat: bodyFatEl && bodyFatEl.value ? parseFloat(bodyFatEl.value) : null,
      dailyPAL: document.getElementById('user-daily-pal').value,
      exerciseKcal: document.getElementById('user-exercise-level').value,
      exerciseMode: document.getElementById('user-exercise-mode').value,
      targetWeight: parseFloat(document.getElementById('user-target-weight').value) || 60,
      targetBodyFat: targetBodyFatEl && targetBodyFatEl.value ? parseFloat(targetBodyFatEl.value) : null,
      targetHabit: document.getElementById('user-target-habit').value,
      targetDate: targetDate || null
    };
    if (!userData.name) return;

    // 健康检查
    if (targetDate && userData.targetHabit !== 'maintain') {
      const check = checkHealthWarning(userData);
      if (!check.healthy) {
        pendingUserData = userData;
        document.getElementById('health-warning-body').innerHTML =
          `<p>根据您的设置：</p>
          <p style="color:#d94a4a;margin:8px 0;">${check.warning}</p>
          <p style="color:var(--text-secondary);font-size:13px;">${check.rate}<br>建议调整目标日期或目标体重后重新提交。</p>`;
        document.getElementById('modal-health-warning').classList.remove('hidden');
        return;
      }
    }

    saveUserData(userData);
  } catch (err) {
    console.error('用户保存失败:', err);
    alert('保存失败：' + err.message);
  }
});

function saveUserData(userData) {
  const id = userData.id;
  const existingIdx = users.findIndex(u => u.id === id);
  if (existingIdx >= 0) {
    // 保留已有密码哈希（编辑用户时不修改密码）
    if (!userData.passwordHash && users[existingIdx].passwordHash) {
      userData.passwordHash = users[existingIdx].passwordHash;
    }
    users[existingIdx] = userData;
  } else {
    users.push(userData);
  }
  if (!currentUser || currentUser.id === userData.id) currentUser = userData;
  if (users.length === 1) currentUser = users[0];
  saveData();
  document.getElementById('user-form-wrap').classList.add('hidden');
  document.getElementById('modal-health-warning').classList.add('hidden');
  pendingUserData = null;
  renderUsers();
}

// 健康警告弹窗按钮
document.getElementById('btn-close-health-warning').addEventListener('click', function () {
  document.getElementById('modal-health-warning').classList.add('hidden');
  pendingUserData = null;
});
document.getElementById('btn-cancel-health').addEventListener('click', function () {
  document.getElementById('modal-health-warning').classList.add('hidden');
  pendingUserData = null;
});
document.getElementById('btn-confirm-health').addEventListener('click', function () {
  if (pendingUserData) saveUserData(pendingUserData);
});

document.getElementById('dish-form').addEventListener('submit', function (e) {
  e.preventDefault();
  const id = document.getElementById('dish-id').value;
  // Parse ingredient text to ingredient references
  const ingText = document.getElementById('dish-ingredients').value.trim();
  const ingredients = [];
  if (ingText) {
    const lines = ingText.split('\n').filter(l => l.trim());
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts.length < 2) continue;
      const g = parseFloat(parts[parts.length - 1]);
      if (isNaN(g)) continue;
      const name = parts.slice(0, -1).join('');
      // Find matching ingredient
      const allIngs = getAllIngredients();
      const match = allIngs.find(i => i.name === name || i.name.includes(name) || name.includes(i.name));
      if (match) {
        ingredients.push({ id: match.id, g });
      }
    }
  }

  const cal = Number(document.getElementById('dish-calories').value);
  const autoNut = calcDishNutritionFromIngredients(ingredients, document.getElementById('dish-cooking-method').value);
  const dishData = {
    id: id || generateId('cd_'),
    name: document.getElementById('dish-name').value.trim(),
    category: document.getElementById('dish-category').value,
    cookingMethodId: document.getElementById('dish-cooking-method').value,
    calories: cal || autoNut.calories,
    protein: Number(document.getElementById('dish-protein').value) || autoNut.protein,
    carbs: Number(document.getElementById('dish-carbs').value) || autoNut.carbs,
    fat: Number(document.getElementById('dish-fat').value) || autoNut.fat,
    sodium: Number(document.getElementById('dish-sodium').value) || autoNut.sodium,
    fiber: Number(document.getElementById('dish-fiber').value) || autoNut.fiber,
    saturatedFat: Number(document.getElementById('dish-satfat').value) || autoNut.saturatedFat,
    sugar: Number(document.getElementById('dish-sugar').value) || autoNut.sugar,
    ingredients, isBuiltin: false, isCustom: true,
    userId: currentUser ? currentUser.id : null
  };

  if (!dishData.name) return;

  if (id) {
    const idx = customDishes.findIndex(d => d.id === id);
    if (idx >= 0) customDishes[idx] = dishData;
  } else {
    customDishes.push(dishData);
  }
  saveData(); closeDishForm();
  renderDishLibrary(document.getElementById('dish-search').value, document.getElementById('dish-category-filter').value);
});

document.getElementById('ingredient-form').addEventListener('submit', function (e) {
  e.preventDefault();
  const id = document.getElementById('ingredient-id').value;
  const ingData = {
    id: id || generateId('ci_'),
    name: document.getElementById('ingredient-name').value.trim(),
    category: document.getElementById('ingredient-category').value,
    calories: parseFloat(document.getElementById('ingredient-calories').value) || 0,
    protein: parseFloat(document.getElementById('ingredient-protein').value) || 0,
    carbs: parseFloat(document.getElementById('ingredient-carbs').value) || 0,
    fat: parseFloat(document.getElementById('ingredient-fat').value) || 0,
    sodium: parseFloat(document.getElementById('ingredient-sodium').value) || 0,
    fiber: parseFloat(document.getElementById('ingredient-fiber').value) || 0,
    saturatedFat: parseFloat(document.getElementById('ingredient-satfat').value) || 0,
    sugar: parseFloat(document.getElementById('ingredient-sugar').value) || 0,
    isBuiltin: false
  };
  if (!ingData.name) return;
  if (id) {
    const idx = customIngredients.findIndex(i => i.id === id);
    if (idx >= 0) customIngredients[idx] = ingData;
  } else {
    customIngredients.push(ingData);
  }
  saveData(); closeIngredientForm();
  renderIngredientLibrary(document.getElementById('ingredient-search').value, document.getElementById('ingredient-category-filter').value);
});

// ============ 密码哈希（Web Crypto SHA-256）============

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ============ 登录 / 注册 / 退出 ============

function showLoginOverlay() {
  document.getElementById('login-overlay').classList.add('active');
  document.getElementById('login-error').classList.add('hidden');
  document.getElementById('login-password').value = '';
  // 填充用户列表
  const sel = document.getElementById('login-user-select');
  sel.innerHTML = '<option value="">-- 请选择 --</option>';
  for (const u of users) {
    sel.innerHTML += `<option value="${u.id}">${u.name}</option>`;
  }
  // 没有用户 → 直接显示注册
  if (users.length === 0) {
    document.getElementById('login-form-wrap').parentElement.classList.add('hidden');
    document.getElementById('register-card').classList.remove('hidden');
  } else {
    document.getElementById('login-form-wrap').parentElement.classList.remove('hidden');
    document.getElementById('register-card').classList.add('hidden');
  }
}

function hideLoginOverlay() {
  document.getElementById('login-overlay').classList.remove('active');
}

// 登录
document.getElementById('btn-login').addEventListener('click', async function () {
  const userId = document.getElementById('login-user-select').value;
  const password = document.getElementById('login-password').value;
  const errEl = document.getElementById('login-error');

  if (!userId) { errEl.textContent = '请选择用户'; errEl.classList.remove('hidden'); return; }

  const user = users.find(u => u.id === userId);
  if (!user) { errEl.textContent = '用户不存在'; errEl.classList.remove('hidden'); return; }

  const inputHash = await hashPassword(password);
  // 没有密码哈希的旧用户，空密码可登录
  const storedHash = user.passwordHash || '';
  if (inputHash !== storedHash) {
    errEl.textContent = '密码错误';
    errEl.classList.remove('hidden');
    return;
  }

  currentUser = user;
  sessionStorage.setItem('mealplanner_loggedIn', userId);
  hideLoginOverlay();
  switchNav('user');
});

// 回车登录
document.getElementById('login-password').addEventListener('keydown', function (e) {
  if (e.key === 'Enter') document.getElementById('btn-login').click();
});

// 回车注册
document.getElementById('register-password2').addEventListener('keydown', function (e) {
  if (e.key === 'Enter') document.getElementById('btn-register').click();
});

// 注册
document.getElementById('btn-register').addEventListener('click', async function () {
  const name = document.getElementById('register-name').value.trim();
  const pwd = document.getElementById('register-password').value;
  const pwd2 = document.getElementById('register-password2').value;
  const errEl = document.getElementById('register-error');

  if (!name) { errEl.textContent = '请输入姓名'; errEl.classList.remove('hidden'); return; }
  if (pwd.length < 4) { errEl.textContent = '密码至少4位'; errEl.classList.remove('hidden'); return; }
  if (pwd !== pwd2) { errEl.textContent = '两次密码不一致'; errEl.classList.remove('hidden'); return; }

  const passwordHash = await hashPassword(pwd);
  const userData = {
    id: generateId('u_'),
    name: name,
    age: 30, gender: 'male', height: 170, weight: 65,
    bodyFat: null,
    dailyPAL: '1.6', exerciseKcal: '120',
    exerciseMode: 'rough',
    targetWeight: 60, targetBodyFat: null,
    targetHabit: 'maintain', targetDate: null,
    passwordHash: passwordHash
  };
  users.push(userData);
  currentUser = userData;
  saveData();
  sessionStorage.setItem('mealplanner_loggedIn', userData.id);
  hideLoginOverlay();
  switchNav('user');
});

// 切换登录/注册
document.getElementById('btn-show-register').addEventListener('click', function () {
  document.getElementById('login-form-wrap').parentElement.classList.add('hidden');
  document.getElementById('register-card').classList.remove('hidden');
  document.getElementById('register-name').value = '';
  document.getElementById('register-password').value = '';
  document.getElementById('register-password2').value = '';
  document.getElementById('register-error').classList.add('hidden');
});

document.getElementById('btn-show-login').addEventListener('click', function () {
  document.getElementById('login-form-wrap').parentElement.classList.remove('hidden');
  document.getElementById('register-card').classList.add('hidden');
  showLoginOverlay();
});

// 退出登录
document.getElementById('btn-logout').addEventListener('click', function () {
  sessionStorage.removeItem('mealplanner_loggedIn');
  currentUser = null;
  showLoginOverlay();
});

// ============ 初始化 ============

function init() {
  loadData();

  // 检查登录状态
  const loggedInId = sessionStorage.getItem('mealplanner_loggedIn');
  if (loggedInId) {
    const u = users.find(u => u.id === loggedInId);
    if (u) {
      currentUser = u;
    } else {
      sessionStorage.removeItem('mealplanner_loggedIn');
    }
  }

  // 初始化热量单位按钮状态
  document.querySelectorAll('.unit-btn').forEach(b => b.classList.toggle('active', b.dataset.unit === calorieUnit));

  if (currentUser) {
    // 已登录：隐藏遮罩，正常初始化
    hideLoginOverlay();
    switchNav('user');
  } else if (users.length > 0) {
    // 有用户但未登录：显示登录
    showLoginOverlay();
  } else {
    // 无用户：显示注册
    showLoginOverlay();
  }
}

init();
