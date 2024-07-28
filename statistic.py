import requests
import time
from datetime import datetime
import json

def send_message(token, chat_id, message):
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = {
        'chat_id': chat_id,
        'text': message
    }
    response = requests.post(url, data=payload)
    print(f"Message sent to chat ID {chat_id}")

with open('data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

def aggregate_likes_dislikes(data):
    total_likes = 0
    total_dislikes = 0
    post_count = 0 

    for post in data:
        if post.get('status') == 'done': 
            post_count += 1
            total_likes += post['likes']
            total_dislikes += post['dislikes']

    return total_likes, total_dislikes, post_count

bot_token = '7055788450:AAHPBWxXC4tBNsRg53WOlLGGofmukjSU4PM'
admin_chat_id = 1488037388

schedule_time = "22:29"

while True:
    now = datetime.now()
    current_time = now.strftime("%H:%M")
    
    if current_time == schedule_time:
        total_likes, total_dislikes, post_count = aggregate_likes_dislikes(data)
        
        message = f"Ежедневный отчёт:\nВсего постов (done): {post_count}\nВсего лайков: {total_likes}\nВсего дизлайков: {total_dislikes}"
        
        send_message(bot_token, admin_chat_id, message)
        
    time.sleep(60)
