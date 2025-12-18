from flask import Flask, request, render_template, make_response, redirect, url_for
import pandas as pd
import json
from datetime import datetime
import io
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here'

def load_data(file_content):
    """Загрузка данных из Excel файла"""
    try:
        df = pd.read_excel(io.BytesIO(file_content))

        expected_columns = ['Оборудование', 'Дата/Время начала', 'Дата/Время окончания', 'Статус']
        if len(df.columns) == 4:
            df.columns = expected_columns

        df['Дата/Время начала'] = pd.to_datetime(df['Дата/Время начала'], errors='coerce')
        df['Дата/Время окончания'] = pd.to_datetime(df['Дата/Время окончания'], errors='coerce')

        df = df.dropna(subset=['Дата/Время начала', 'Дата/Время окончания']).reset_index(drop=True)
        df['Длительность_час'] = (df['Дата/Время окончания'] - df['Дата/Время начала']).dt.total_seconds() / 3600

        return df

    except Exception as e:
        print(f"Ошибка загрузки данных: {e}")
        return None

def prepare_dashboard_data(df):
    """Подготовка данных для dashboard"""
    equipment_list = df['Оборудование'].unique().tolist()
    status_list = df['Статус'].unique().tolist()

    # Цвета для статусов
    status_colors = {
        'Готов к работе': '#FF6B6B',
        'Работа': '#51CF66',
        'Не мониторится': '#868E96',
        'Выключен': '#FF922B',
        'Перегрузка': '#F06595',
        'Неопределённый': '#5F3DC4'
    }

    # Назначаем цвета статусам
    for status in status_list:
        if status not in status_colors:
            status_colors[status] = '#666666'

    # Создаем данные для JavaScript
    js_data = {
        'equipment_list': equipment_list,
        'status_list': status_list,
        'status_colors': status_colors,
        'records': []
    }

    # Добавляем записи в формате для JS
    for _, row in df.iterrows():
        js_data['records'].append({
            'equipment': row['Оборудование'],
            'start_time': row['Дата/Время начала'].isoformat(),
            'end_time': row['Дата/Время окончания'].isoformat(),
            'status': row['Статус'],
            'duration_hours': float(row['Длительность_час'])
        })

    return {
        'equipment_list': equipment_list,
        'status_list': status_list,
        'status_colors': status_colors,
        'js_data': json.dumps(js_data, ensure_ascii=False, indent=2),
        'records_count': len(df),
        'equipment_count': len(equipment_list),
        'current_time': pd.Timestamp.now().strftime('%d.%m.%Y %H:%M')
    }

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload')
def upload_page():
    return render_template('upload.html')

@app.route('/generate', methods=['POST'])
def generate_report():
    try:
        print("=== НАЧАЛО ОБРАБОТКИ ФАЙЛА ===")

        if 'file' not in request.files:
            print("❌ Файл не найден в запросе")
            return render_template('upload.html', error="Файл не выбран")

        file = request.files['file']
        print(f"📁 Получен файл: {file.filename}")

        if file.filename == '':
            print("❌ Имя файла пустое")
            return render_template('upload.html', error="Файл не выбран")

        if file and (file.filename.endswith('.xlsx') or file.filename.endswith('.xls')):
            file_content = file.read()
            print(f"📊 Размер файла: {len(file_content)} байт")

            df = load_data(file_content)
            print(f"📈 Данные загружены: {df is not None}")

            if df is None:
                print("❌ Ошибка: DataFrame = None")
                return render_template('upload.html', error="Ошибка при чтении файла. Проверьте формат данных.")

            if len(df) == 0:
                print("❌ Ошибка: DataFrame пустой")
                return render_template('upload.html', error="Файл не содержит данных или данные в неправильном формате.")

            print(f"✅ Успешно загружено {len(df)} строк")

            # Подготовка данных для дашборда
            dashboard_data = prepare_dashboard_data(df)
            print("✅ Данные для дашборда подготовлены")

            try:
                # Проверяем доступность шаблона
                print("🔄 Попытка рендеринга шаблона...")
                html_content = render_template('dashboard.html', **dashboard_data)
                print("✅ HTML шаблон сгенерирован")
            except Exception as template_error:
                print(f"❌ Ошибка рендеринга шаблона: {template_error}")
                # Создаем простой HTML как запасной вариант
                html_content = create_fallback_html(dashboard_data)
                print("✅ Использован запасной HTML")

            # Создаем ответ для скачивания
            response = make_response(html_content)
            response.headers['Content-Type'] = 'text/html; charset=utf-8'
            filename = f"equipment_analysis_{datetime.now().strftime('%Y%m%d_%H%M')}.html"
            response.headers['Content-Disposition'] = f'attachment; filename="{filename}"'

            print("✅ Отчет успешно создан и отправлен")
            return response

        else:
            print("❌ Неподдерживаемый формат файла")
            return render_template('upload.html', error="Поддерживаются только Excel файлы (.xlsx, .xls)")

    except Exception as e:
        print(f"💥 КРИТИЧЕСКАЯ ОШИБКА: {str(e)}")
        import traceback
        print(f"🔍 TRACEBACK: {traceback.format_exc()}")
        return render_template('upload.html', error=f"Произошла ошибка: {str(e)}")

def create_fallback_html(dashboard_data):
    """Создает простой HTML отчет если шаблон недоступен"""
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Анализ оборудования</title>
        <script src="https://cdn.plot.ly/plotly-2.24.1.min.js"></script>
    </head>
    <body>
        <h1>Анализ статусов оборудования</h1>
        <p>Отчет создан: {dashboard_data.get('current_time', 'N/A')}</p>
        <p>Записей: {dashboard_data.get('records_count', 0)}</p>
        <p>Оборудование: {dashboard_data.get('equipment_count', 0)} ед.</p>
        <div id="data" style="display:none">{dashboard_data.get('js_data', '{}')}</div>
        <script>
            console.log('Упрощенный отчет загружен');
        </script>
    </body>
    </html>
    """

@app.route('/thank-you')
def thank_you():
    return render_template('thank_you.html')

@app.route('/test')
def test():
    return "✅ Сервис работает! Сайт активен."

if __name__ == '__main__':
    app.run(debug=True)