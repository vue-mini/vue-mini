#!/usr/bin/env sh

set -e

yarn docs:build

cd docs/.vuepress/dist

git config user.email 'y.mingshan3@gmail.com'
git config user.name 'Yang Mingshan'
git init
git add -A
git commit -m 'deploy'

git push -f https://yangmingshan:$ACCESS_TOKEN@github.com/vue-mini/vue-mini.github.io.git master

cd -
