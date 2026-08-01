from django.shortcuts import render

def index(request):
    equation_presets = {
        "Polynomials": [
            {"name": "Linear", "latex": "2x - 5"},
            {"name": "Quadratic", "latex": "x^{2} - 10"},
            {"name": "Cubic", "latex": "0.1x^{3} - 2x"},
        ],
        "Trigonometry": [
            {"name": "Sine Wave", "latex": "\\sin(x)"},
            {"name": "Cosine Wave", "latex": "\\cos(x)"},
            {"name": "Tangent", "latex": "\\tan(x)"},
        ],
        "Exponential & Log": [
            {"name": "Exponential", "latex": "2^{x}"},
            {"name": "Natural Log", "latex": "\\ln(x)"},
        ]
    }
    return render(request, 'graph_app/index.html', {'presets': equation_presets})