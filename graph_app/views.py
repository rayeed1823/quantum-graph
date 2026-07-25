from django.shortcuts import render

def index(request):
    equation_presets = {
        "Polynomials": [
            {"name": "Linear", "latex": "2x - 5"},
            {"name": "Quadratic", "latex": "x^{2} - 10"},
            {"name": "Cubic", "latex": "0.1x^{3} - 2x"},
        ],
        "Trigonometry": [
            {"name": "Sine Wave", "latex": "\\sin\\left(x\\right)"},
            {"name": "Cosine Wave", "latex": "\\cos\\left(x\\right)"},
            {"name": "Tangent", "latex": "\\tan\\left(x\\right)"},
        ],
        "Exponential & Log": [
            {"name": "Exponential", "latex": "2^{x}"},
            {"name": "Natural Log", "latex": "\\ln\\left(x\\right)"},
        ]
    }
    return render(request, 'graph_app/index.html', {'presets': equation_presets})