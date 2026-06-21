#!/bin/zsh
# 清理构建产物
# 用途: 删除 node_modules、target、dist 等所有生成文件，恢复 clean 状态
# 警告: 该脚本会递归删除大量文件，请谨慎使用
# 用法: 在项目根目录执行: ./scripts/clean.sh
# 要求: zsh

echo "Warning: This is a trigger happy script that deletes lots of things, you have been warned <insert lorax picture>."
echo "Warning: This script is expected to be run in the root of your gitbutler checkout like ./scripts/clean.sh with zsh. Running it in a different manner may cause unexpected file loss."
printf "Are you sure you want to delete all the generated artifacts? (y/n) "
read confirmed

if [ "$confirmed" = "${confirmed#[yY]}" ]; then
    echo "Aborting"
    exit 1
fi

echo "Removing node modules..."
rm -rf **/node_modules/
rm -rf node_modules/

echo "Removing typescript artifacts..."
rm -rf **/tsconfig.tsbuildinfo

echo "Removing rust artifacts..."
rm -rf .rust-analyzer
rm -rf target

echo "Removing rust fixtures..."
rm -rf crates/*/tests/fixtures/generated-do-not-edit

echo "Removing turbo caches..."
rm -rf **/.turbo/
rm -rf .turbo/

echo "Removing TS build artifacts..."

rm -rf packages/*/dist/
rm -rf packages/*/build/
rm -rf packages/*/.svelte-kit
rm -rf apps/*/.vercel

rm -rf apps/*/dist/
rm -rf apps/*/build/
rm -rf apps/*/.svelte-kit
rm -rf apps/*/.vercel