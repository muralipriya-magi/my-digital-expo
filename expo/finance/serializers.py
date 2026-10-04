from rest_framework import serializers
from .models import Transaction


class TransactionSerializer(serializers.ModelSerializer):
    expo_title = serializers.CharField(source='expo.title', read_only=True)

    class Meta:
        model = Transaction
        fields = [
            'id',
            'expo',
            'expo_title',
            'transaction_type',
            'amount',
            'commission_amount',
            'organizer_amount',
            'payment_method',
            'payment_reference',
            'status',
            'created_at',
        ]
