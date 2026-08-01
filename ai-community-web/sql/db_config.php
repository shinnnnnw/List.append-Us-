<?php
$host = "127.0.0.1";
$user = "root";
$pass = "";
$dbname = "202607_hackson";
$port = 3307; // 如果你的 MariaDB 是別的 port 就改掉

$conn = mysqli_connect($host, $user, $pass, $dbname, $port);

if($conn->connect_error){
 die("連線失敗");
}

// MySQL 連線也設定為台灣時區
$conn->query("SET time_zone = '+08:00'")
?>