[1mdiff --git a/server/database_main.sqlite b/server/database_main.sqlite[m
[1mnew file mode 100644[m
[1mindex 0000000..63899bb[m
Binary files /dev/null and b/server/database_main.sqlite differ
[1mdiff --git a/server/nodemon.json b/server/nodemon.json[m
[1mindex 834e295..4ac45bf 100644[m
[1m--- a/server/nodemon.json[m
[1m+++ b/server/nodemon.json[m
[36m@@ -1,8 +1,8 @@[m
 {[m
     "ignore": [[m
[31m-        "./src",[m
[31m-        "!./package.json",[m
[31m-        "!./nodemon.json",[m
[32m+[m[32m        "**/*.json",[m
[32m+[m[32m        "!**/package.json",[m
[32m+[m[32m        "!**/nodemon.json",[m
         "**/tests/**",[m
         "**/test.js",[m
         "README"[m
[1mdiff --git a/server/word_database_main.sqlite b/server/word_database_main.sqlite[m
[1mnew file mode 100644[m
[1mindex 0000000..a15109c[m
Binary files /dev/null and b/server/word_database_main.sqlite differ
